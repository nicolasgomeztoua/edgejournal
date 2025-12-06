import { Hero } from "./_components/hero";
import { Features } from "./_components/features";
import { AIShowcase } from "./_components/ai-showcase";
import { Pricing } from "./_components/pricing";

export default function LandingPage() {
	return (
		<>
			<Hero />
			<Features />
			<AIShowcase />
			<Pricing />
		</>
	);
}

