import { Stack, Text } from "@sanity/ui";
import type { SlugInputProps } from "sanity";
import { appOrigin } from "../config/env";

/** Slug input for `uri` that shows the full public URL under the field. */
export function UriInput(props: SlugInputProps) {
  const current = props.value?.current;
  return (
    <Stack gap={2}>
      {props.renderDefault(props)}
      <Text size={1} muted>
        {current ? `${appOrigin}${current}` : "The path becomes the public URL"}
      </Text>
    </Stack>
  );
}
