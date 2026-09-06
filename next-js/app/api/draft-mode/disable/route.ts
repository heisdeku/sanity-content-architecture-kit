import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { asRoute } from "@/features/utils/route-href";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  (await draftMode()).disable();
  const referer = request.headers.get("referer");
  const back =
    referer && new URL(referer).origin === new URL(request.url).origin
      ? new URL(referer).pathname
      : "/";
  redirect(asRoute(back));
}
