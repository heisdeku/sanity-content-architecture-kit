import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useState } from "react";
import { type StringInputProps, set, unset, useFormValue } from "sanity";
import { appOrigin } from "../config/env";

type GenerateResponse = { markdown?: string; error?: string; hint?: string };

/**
 * Input for `agents.markdown` on routed documents. The button asks the app
 * to run the deterministic serializer over this document
 * (`POST /api/agents/markdown/generate` with `{ id }`) and writes the
 * returned Markdown into the field.
 */
export function GenerateMarkdownInput(props: StringInputProps) {
  const documentId = useFormValue(["_id"]) as string | undefined;
  const [status, setStatus] = useState<{
    state: "idle" | "busy" | "error" | "done";
    message?: string;
  }>({
    state: "idle",
  });

  async function generate() {
    if (!documentId) return;
    setStatus({ state: "busy" });
    try {
      const response = await fetch(
        `${appOrigin}/api/agents/markdown/generate`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: documentId }),
        },
      );
      const data = (await response
        .json()
        .catch(() => ({}))) as GenerateResponse;
      if (!response.ok)
        throw new Error(data.error ?? `Request failed (${response.status})`);
      if (typeof data.markdown !== "string")
        throw new Error("The app returned no Markdown");
      props.onChange(data.markdown ? set(data.markdown) : unset());
      setStatus({
        state: "done",
        message: "Generated from the current content",
      });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Generation failed",
      });
    }
  }

  return (
    <Stack gap={3}>
      <Card
        padding={3}
        radius={2}
        tone={status.state === "error" ? "critical" : "transparent"}
        border
      >
        <Flex align="center" gap={3}>
          <Button
            text="Generate from page content"
            tone="primary"
            mode="ghost"
            disabled={!documentId || status.state === "busy"}
            loading={status.state === "busy"}
            onClick={generate}
          />
          <Text size={1} muted>
            {status.message ??
              "Serializes the sections of this page to Markdown"}
          </Text>
        </Flex>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  );
}
