import { useRive } from '@rive-app/react-canvas';
import { useReducedMotion } from '@/features/motion/use-reduced-motion';

export function RivePlayer({
  src,
  aspectRatio,
  stateMachine,
}: {
  src: string;
  aspectRatio: number;
  stateMachine?: string | undefined;
}) {
  const reduced = useReducedMotion();
  const { RiveComponent } = useRive({
    src,
    autoplay: !reduced,
    stateMachines: stateMachine,
  });
  return (
    <div style={{ aspectRatio: String(aspectRatio), width: '100%' }}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
