import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useState } from "react";
import { type ObjectInputProps, set, useClient } from "sanity";
import { DEFAULT_API_VERSION } from "../config/constants";

type Dimensions = { width: number; height: number };

type FileValue = {
  file?: { asset?: { _ref?: string } };
  width?: number;
  height?: number;
};

async function readLottieDimensions(url: string): Promise<Dimensions> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Could not download the file (${response.status})`);
  const text = await response.text();
  let json: { w?: unknown; h?: unknown };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      "Only .json Lottie files can be read. Enter the size manually for .lottie",
    );
  }
  const width = Number(json.w);
  const height = Number(json.h);
  if (!width || !height) throw new Error("The file has no w/h values");
  return { width: Math.round(width), height: Math.round(height) };
}

async function readRiveDimensions(url: string): Promise<Dimensions> {
  // Loaded on demand so the Studio bundle does not pay for the runtime.
  const runtime = await import("@rive-app/react-canvas");
  const canvas = document.createElement("canvas");
  return new Promise((resolve, reject) => {
    const rive = new runtime.Rive({
      src: url,
      canvas,
      autoplay: false,
      onLoad: () => {
        const bounds = rive.bounds;
        rive.cleanup();
        if (!bounds)
          return reject(new Error("Could not read the artboard size"));
        resolve({
          width: Math.round(bounds.maxX - bounds.minX),
          height: Math.round(bounds.maxY - bounds.minY),
        });
      },
      onLoadError: () =>
        reject(new Error("The Rive runtime could not load the file")),
    });
  });
}

/**
 * Object input for `appLottie` and `appRive`. Adds a "Generate dimensions"
 * button that reads the intrinsic size from the uploaded file and writes
 * `width` and `height`, so the frontend can reserve the box before the
 * animation loads.
 */
export function GenerateMediaDimensionsInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion: DEFAULT_API_VERSION });
  const [status, setStatus] = useState<{
    state: "idle" | "busy" | "error" | "done";
    message?: string;
  }>({
    state: "idle",
  });
  const value = props.value as FileValue | undefined;
  const assetRef = value?.file?.asset?._ref;
  const isRive = props.schemaType.name === "appRive";

  async function generate() {
    if (!assetRef) return;
    setStatus({ state: "busy" });
    try {
      const url = await client.fetch<string | null>("*[_id == $id][0].url", {
        id: assetRef,
      });
      if (!url) throw new Error("The file asset has no URL yet");
      const dimensions = isRive
        ? await readRiveDimensions(url)
        : await readLottieDimensions(url);
      props.onChange([
        set(dimensions.width, ["width"]),
        set(dimensions.height, ["height"]),
      ]);
      setStatus({
        state: "done",
        message: `${dimensions.width} x ${dimensions.height}`,
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
      {props.renderDefault(props)}
      <Card
        padding={3}
        radius={2}
        tone={status.state === "error" ? "critical" : "transparent"}
        border
      >
        <Flex align="center" gap={3}>
          <Button
            text="Generate dimensions"
            tone="primary"
            mode="ghost"
            disabled={!assetRef || status.state === "busy"}
            loading={status.state === "busy"}
            onClick={generate}
          />
          <Text size={1} muted>
            {status.message ??
              (assetRef
                ? "Reads the width and height from the file"
                : "Upload a file first")}
          </Text>
        </Flex>
      </Card>
    </Stack>
  );
}
