import ConsentWrapper from "./consentWrapper";
import Featured from "@/components/Featured";
import HeroCard from "@/components/HeroCard";

export default function HomePage() {
  return (
    <ConsentWrapper>
      <HeroCard />
      <Featured />
    </ConsentWrapper>
  );
}
