/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { BarberHero } from '../components/Hero';
import { TrustStats } from '../components/TrustStats';
import { BarberServices } from '../components/Services';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { SpecialOfferBanner } from '../components/SpecialOfferBanner';
import { MeetBarbers } from '../components/MeetBarbers';
import { TransformationGallery } from '../components/TransformationGallery';
import { CustomerTestimonials } from '../components/CustomerTestimonials';
import { MembershipPackages } from '../components/MembershipPackages';
import { GroomingProducts } from '../components/GroomingProducts';
import { SocialGallery } from '../components/SocialGallery';
import { GroomingBlog } from '../components/GroomingBlog';
import { FAQSection } from '../components/FAQSection';
import { FinalCTA } from '../components/FinalCTA';
import { NewsletterSection } from '../components/NewsletterSection';
import { 
  OwnerFounderSection, 
  VideoShowcaseSection, 
  IndustryGallerySection 
} from '../../../components/shared/SalonCustomizationComponents';
import { useSalonCustomization } from '../../../hooks/useSalonCustomization';

interface HomePageProps {
  onNavigate?: (page: any) => void;
  onAddToCart?: (product: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onAddToCart }) => {
  const { customization } = useSalonCustomization();
  const { ownerProfile, socialAndVideo, galleryImages } = customization;

  return (
    <div className="space-y-0">
      {/* A. Announcement Bar */}
      <AnnouncementBar />

      {/* B. Hero Section */}
      <BarberHero onNavigate={onNavigate} />

      {/* C. Trust & Statistics */}
      <TrustStats />

      {/* D. Featured Services */}
      <BarberServices onNavigate={onNavigate} />

      {/* E. Why Choose Us */}
      <WhyChooseUs />

      {/* F. Meet The Founder / Owner Story */}
      <OwnerFounderSection 
        name={ownerProfile.name}
        role={ownerProfile.role}
        photoUrl={ownerProfile.photoUrl}
        bio={ownerProfile.bio}
        welcomeMessage={ownerProfile.welcomeMessage}
        yearsExperience={ownerProfile.yearsExperience}
        accentColor="#C9A45C"
        onBookWithOwner={() => onNavigate && onNavigate('booking')}
      />

      {/* G. Special Offer Banner */}
      <SpecialOfferBanner onClaimOffer={() => onNavigate && onNavigate('booking')} />

      {/* H. Meet Our Barbers */}
      <MeetBarbers onSelectBarber={(barber) => onNavigate && onNavigate('booking')} />

      {/* I. Before & After Gallery */}
      <TransformationGallery />

      {/* J. YouTube & Instagram Video Studio */}
      <VideoShowcaseSection 
        title={socialAndVideo.youtubeTitle}
        youtubeUrl={socialAndVideo.youtubeVideoUrl}
        instagramUrl={socialAndVideo.instagramFeedUrl}
        accentColor="#C9A45C"
      />

      {/* K. Customer Testimonials */}
      <CustomerTestimonials />

      {/* L. Dynamic 10-Photo Portfolio Gallery */}
      <IndustryGallerySection 
        title="Studio Portfolio & Master Gallery"
        images={galleryImages}
        accentColor="#C9A45C"
      />

      {/* M. Membership & Packages */}
      <MembershipPackages onSelectPackage={(pkg) => onNavigate && onNavigate('booking')} />

      {/* N. Grooming Products */}
      <GroomingProducts onAddToCart={onAddToCart} />

      {/* O. Instagram-Style Social Gallery */}
      <SocialGallery />

      {/* P. Grooming Blog */}
      <GroomingBlog />

      {/* Q. FAQ Section */}
      <FAQSection />

      {/* R. Final CTA */}
      <FinalCTA onNavigate={onNavigate} />

      {/* S. Newsletter */}
      <NewsletterSection onNavigate={onNavigate} />
    </div>
  );
};
