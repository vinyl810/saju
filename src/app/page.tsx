import { BirthForm } from '@/components/saju/birth-form';
import { HomeHero } from '@/components/home/home-hero';
import { FeatureCards } from '@/components/home/feature-cards';

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="-mt-8 relative z-10">
          <BirthForm />
        </div>
        <FeatureCards />
      </div>
    </>
  );
}
