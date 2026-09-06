import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useState } from "react";
import { type StringInputProps, set, unset, useFormValue } from "sanity";
import { appOrigin } from "../config/env";

type GenerateResponse = { llmsTxt?: string; error?: string; hint?: string };

/**
 * Input for `site.agents.llmsTxt`. The button asks the app to build
 * llms.txt from the published inventory (`POST /api/agents/llms-txt/generate`)
 * and writes the result into the field.
 */
export function GenerateLlmsTxtInput(props: StringInputProps) {
  const documentId = useFormValue(["_id"]) as string | undefined;
  const [status, setStatus] = useState<{
    state: "idle" | "busy" | "error" | "done";
    message?: string;
  }>({
    state: "idle",
  });

  async function generate() {
    setStatus({ state: "busy" });
    try {
      const response = await fetch(
        `${appOrigin}/api/agents/llms-txt/generate`,
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
      if (typeof data.llmsTxt !== "string")
        throw new Error("The app returned no text");
      props.onChange(data.llmsTxt ? set(data.llmsTxt) : unset());
      setStatus({
        state: "done",
        message: "Generated. Review before publishing",
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
            text="Generate from site content"
            tone="primary"
            mode="ghost"
            disabled={status.state === "busy"}
            loading={status.state === "busy"}
            onClick={generate}
          />
          <Text size={1} muted>
            {status.message ?? "Builds llms.txt from every indexable page"}
          </Text>
        </Flex>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  );
}
