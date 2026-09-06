import { useMediaQuery } from '@mantine/hooks';

/** True on coarse pointer devices (touch first). */
export function useTouch(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)', false) ?? false;
}
