import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Heart,
  Info,
  type LucideProps,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Search,
  Send,
  Shield,
  Sparkles,
  Star,
  User,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import type { IconName } from "@/sanity/config/constants";

/** Maps the fixed `ICON_NAMES` set to lucide components. */
const ICONS: Record<IconName, ComponentType<LucideProps>> = {
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  check: Check,
  "chevron-right": ChevronRight,
  download: Download,
  "external-link": ExternalLink,
  "file-text": FileText,
  globe: Globe,
  heart: Heart,
  info: Info,
  mail: Mail,
  "map-pin": MapPin,
  "message-circle": MessageCircle,
  phone: Phone,
  play: Play,
  search: Search,
  send: Send,
  shield: Shield,
  sparkles: Sparkles,
  star: Star,
  user: User,
  zap: Zap,
};

type IconProps = Omit<LucideProps, "name"> & { name?: string | null };

export function Icon({ name, ...props }: IconProps) {
  if (!name || !(name in ICONS)) return null;
  const Component = ICONS[name as IconName];
  return (
    <Component aria-hidden="true" size={16} strokeWidth={1.75} {...props} />
  );
}
