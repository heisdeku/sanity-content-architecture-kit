import { LINK_FRAGMENT } from "./link";
import { IMAGE_FRAGMENT, MEDIA_FRAGMENT } from "./media";

/**
 * Projection for an `appRichText` array. Use as `field[]${RICH_TEXT_FRAGMENT}`.
 * Link annotations (`markDefs` of type `link`) are resolved with the link
 * fragment; inline media blocks with the media/image fragments.
 */
export const RICH_TEXT_FRAGMENT = /* groq */ `{
  ...,
  "markDefs": markDefs[]{
    ...,
    _type == "link" => ${LINK_FRAGMENT}
  },
  _type == "appMedia" => ${MEDIA_FRAGMENT},
  _type == "appImage" => ${IMAGE_FRAGMENT}
}`;
