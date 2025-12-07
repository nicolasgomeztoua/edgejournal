import { AIShowcase } from "./_components/ai-showcase";
import { Features } from "./_components/features";
import { Hero } from "./_components/hero";
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
