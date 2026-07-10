import { MusicIcon } from "lucide-react";

export function MarqueeText(props: { text: string }) {
  const textLength = props.text.length;
  const animationDuration = `${textLength / 2}s`; // Adjust the divisor for desired speed

  return (
    <div className="text-muted-foreground flex items-center overflow-hidden text-sm font-medium">
      <span>
        <MusicIcon className="mr-1 h-4 w-4" />
      </span>
      <div className="marquee-container max-w-full overflow-hidden whitespace-nowrap">
        <div
          className="marquee-content inline-block"
          style={{ animationDuration: animationDuration }}
        >
          <span>{props.text}</span>
          <span>{props.text}</span>
          <span>{props.text}</span>
          <span>{props.text}</span>
          <span>{props.text}</span>
          <span>{props.text}</span>
        </div>
      </div>
    </div>
  );
}

export default function Music() {
  return <MarqueeText text="Not listening to music rn..." />;
}
