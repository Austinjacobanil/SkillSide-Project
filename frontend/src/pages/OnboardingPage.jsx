import { useState } from 'react'
import useAuthUser from "../hooks/useAuthUser.js"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from "react-hot-toast";
import { completeOnboarding } from '../lib/api.js';
import { ArrowsUpFromLine, CameraIcon, LoaderIcon, MapPinIcon, ShuffleIcon } from "lucide-react";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
    subjects: [],
    availability: "",
    goals: "",
    learningStyle: "",
    personality: ""
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
      // console.log(error);
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault();
    // onboardingMutation(formState);
    onboardingMutation({ ...formState, userId: authUser._id });
  }

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 24) + 1;
    const randomAvatar = `https://www.placeholderimage.online/images/avatar/avatar-image-${idx}.png`;
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Profile changed successfully");
  }
  const isFormIncomplete = !formState.fullName || !formState.bio || !formState.location || !formState.subjects || !formState.availability || !formState.goals || !formState.learningStyle || !formState.personality;

  return (
    <div className='min-h-screen bg-base-100 flex items-center justify-center p-4'>
      <div className='card bg-base-200 w-full max-w-3xl shadow-xl'>
        <div className='card-body p-6 sm:p-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-center mb-6'>Complete Your Profile</h1>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* profile pic */}
            <div className='flex flex-col items-center justify-center space-y-4'>
              {/* image preview */}
              <div className='size-32 rounded-full bg-base-300 overflow-hidden'>
                {formState.profilePic ? (
                  <img src={formState.profilePic} alt="Profile preview" className='w-full h-full object-cover' />
                ) : (
                  <div className='flex items-center justify-center h-full'>
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>
              {/* generate random avatar */}
              <div className='flex items-center gap-2'>
                <button type='button' onClick={handleRandomAvatar} className='btn btn-accent'>
                  <ShuffleIcon className='size-4 mr-2' />
                  Generate Random Avatar
                </button>
              </div>
            </div>
            {/* full name*/}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>
            {/* bio */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>
            {/* location */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>
            {/* subjects */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Subjects you're interested in</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., DSA, React, OS"
                value={formState.subjects.join(', ')}
                onChange={(e) =>
                  setFormState({ ...formState, subjects: e.target.value.split(',').map(s => s.trim()) })
                }
              />
            </div>

            {/* availability */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Availability</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Weeknights 8-10PM"
                value={formState.availability}
                onChange={(e) => setFormState({ ...formState, availability: e.target.value })}
              />
            </div>

            {/* goals */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Learning Goals</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Crack FAANG, master backend dev"
                value={formState.goals}
                onChange={(e) => setFormState({ ...formState, goals: e.target.value })}
              />
            </div>

            {/* learning style */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Learning Style</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Teaching others, group study"
                value={formState.learningStyle}
                onChange={(e) => setFormState({ ...formState, learningStyle: e.target.value })}
              />
            </div>

            {/* personality */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Your Personality</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Focused, curious, chill"
                value={formState.personality}
                onChange={(e) => setFormState({ ...formState, personality: e.target.value })}
              />
            </div>

            {/* submit btn */}
            <button className='btn btn-primary w-full' disabled={isPending || isFormIncomplete} type='submit'>
              {!isPending ? (
                <>
                  <ArrowsUpFromLine className='size-5 mr-2' />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className='animate-spin size-5 mr-2' />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}

export default OnboardingPage;
