import { AIShowcase } from "./_components/ai-showcase";
import { CTA } from "./_components/cta";
import { Features } from "./_components/features";
import { Hero } from "./_components/hero";
import { Pricing } from "./_components/pricing";
import { Testimonials } from "./_components/testimonials";

export default function LandingPage() {
	return (
		<>
			<Hero />
			<Features />
			<AIShowcase />
			<Testimonials />
			<Pricing />
			<CTA />
		</>
	);
}
