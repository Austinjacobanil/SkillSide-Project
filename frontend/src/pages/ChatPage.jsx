import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useAuthUser from '../hooks/useAuthUser';
import { getStreamToken } from '../lib/api';
import { upsertStreamUser } from "../lib/api";
import { useQuery } from '@tanstack/react-query';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from 'stream-chat';
import toast from 'react-hot-toast';
import ChatLoader from '../components/ChatLoader';
import CallButton from '../components/CallButton';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setloading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, //only run when authUser is available
  });

  useEffect(() => {
    const client = StreamChat.getInstance(STREAM_API_KEY);
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;
      try {
        console.log("Initializing stream chat calling");
        

        if (client.userID) {
        await client.disconnectUser();
      }

        await upsertStreamUser({
          id: authUser._id.toString(),
          name: authUser.fullName,
          image: authUser.profilePic,
        });

        await upsertStreamUser({
          id: targetUserId.toString(),
          name: "Unknown User",
          image: "/default-avatar.png"
        });

        await client.connectUser({
          id: authUser._id.toString(),
          name: authUser.fullName,
          image: authUser.profilePic,
        }, tokenData.token)
        //creating a channel id
        const channelId = [authUser._id.toString(), targetUserId.toString()].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id.toString(), targetUserId.toString()],
        });
        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);

      } catch (error) {
        console.error("Error initializing chat:", error);
        // toast.error("Could not connect to chat. please try again!");
      }
      finally {
        setloading(false);
      }
    }

    initChat()
  
    return () => {
      client.disconnectUser().catch((err) => {
        console.error('Error disconnecting user:', err);
      });
    };
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      })

      toast.success("Video call link sent successfully!");
    }
  }
  

  if (loading || !chatClient || !channel) return <ChatLoader />

  return (
    <div className='h-[93vh]'>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className='w-full relative'>
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
}

export default ChatPage
