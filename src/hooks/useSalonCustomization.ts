/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface HeaderCustomization {
  brandName: string;
  tagline: string;
  logoUrl: string;
  operatingHours: string;
  phone: string;
  whatsapp: string;
  address: string;
}

export interface OwnerProfile {
  name: string;
  role: string;
  photoUrl: string;
  bio: string;
  welcomeMessage: string;
  yearsExperience: string;
}

export interface SocialAndVideo {
  youtubeVideoUrl: string;
  youtubeTitle: string;
  instagramFeedUrl: string;
  facebookUrl?: string;
  twitterUrl?: string;
}

export interface CustomStaffMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  photoUrl: string;
  rating: number;
}

export interface SalonCustomizationConfig {
  header: HeaderCustomization;
  galleryImages: string[];
  socialAndVideo: SocialAndVideo;
  ownerProfile: OwnerProfile;
  staffDirectory: CustomStaffMember[];
}

const DEFAULT_CUSTOMIZATION: SalonCustomizationConfig = {
  header: {
    brandName: "THE GENT'S DEN",
    tagline: "Barber Atelier • Est. 2021",
    logoUrl: "",
    operatingHours: "Open Daily: 9:00 AM – 9:00 PM",
    phone: "+91 98290 12345",
    whatsapp: "+91 98290 12345",
    address: "Civil Lines Royal Arcade, Jaipur, Rajasthan"
  },
  galleryImages: [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1605497746444-051d2b6da38e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&q=80&w=800"
  ],
  socialAndVideo: {
    youtubeVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    youtubeTitle: "Studio Walkthrough & Haircut Masterclass",
    instagramFeedUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    twitterUrl: "https://twitter.com"
  },
  ownerProfile: {
    name: "Sanjay Singhal",
    role: "Founder & Creative Master Director",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
    bio: "With over 14 years of mastery in international hair art and aesthetic grooming, Sanjay envisioned a sanctuary where precision technique meets royal Rajasthani hospitality.",
    welcomeMessage: "Welcome to our studio. We treat every service not just as a haircut or treatment, but as a signature transformation tailored exclusively for you.",
    yearsExperience: "14+ Years"
  },
  staffDirectory: [
    {
      id: "stf_1",
      name: "Vikram Rathore",
      role: "Senior Master Barber",
      specialty: "Precision Fades & Hot Towel Shaves",
      experience: "8 Yrs",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      rating: 4.9
    },
    {
      id: "stf_2",
      name: "Pooja Sharma",
      role: "Creative Color & Stylist",
      specialty: "Balayage, Keratin & Hair Spa Rituals",
      experience: "6 Yrs",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      rating: 4.85
    },
    {
      id: "stf_3",
      name: "Arjun Verma",
      role: "Beard Sculptor & Facialist",
      specialty: "Beard Sculpting & De-Tan Facials",
      experience: "5 Yrs",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
      rating: 4.8
    }
  ]
};

export const useSalonCustomization = () => {
  const [customization, setCustomization] = useState<SalonCustomizationConfig>(() => {
    try {
      const stored = localStorage.getItem('nexora_salon_customization');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return DEFAULT_CUSTOMIZATION;
  });

  const saveCustomization = (updated: Partial<SalonCustomizationConfig>) => {
    setCustomization(prev => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('nexora_salon_customization', JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save customization to localStorage:", e);
      }
      return next;
    });
  };

  const updateHeader = (headerData: Partial<HeaderCustomization>) => {
    saveCustomization({
      header: { ...customization.header, ...headerData }
    });
  };

  const updateOwnerProfile = (ownerData: Partial<OwnerProfile>) => {
    saveCustomization({
      ownerProfile: { ...customization.ownerProfile, ...ownerData }
    });
  };

  const updateSocialAndVideo = (socialData: Partial<SocialAndVideo>) => {
    saveCustomization({
      socialAndVideo: { ...customization.socialAndVideo, ...socialData }
    });
  };

  const updateGalleryImages = (images: string[]) => {
    saveCustomization({ galleryImages: images });
  };

  const addStaffMember = (member: Omit<CustomStaffMember, 'id'>) => {
    const newMember: CustomStaffMember = {
      ...member,
      id: "stf_" + Math.random().toString(36).substring(2, 9)
    };
    saveCustomization({
      staffDirectory: [newMember, ...customization.staffDirectory]
    });
  };

  const removeStaffMember = (id: string) => {
    saveCustomization({
      staffDirectory: customization.staffDirectory.filter(s => s.id !== id)
    });
  };

  return {
    customization,
    updateHeader,
    updateOwnerProfile,
    updateSocialAndVideo,
    updateGalleryImages,
    addStaffMember,
    removeStaffMember,
    saveCustomization
  };
};

export default useSalonCustomization;
