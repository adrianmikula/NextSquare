import "outstatic/outstatic.css"
import { Outstatic } from "outstatic"
import { OstClient } from "outstatic/client"

export default async function OutstaticPage({
  params,
}: {
  params: Promise<{ ost: string[] }>
}) {
  const ostParams = await params
  const ostData = await Outstatic()

  return <OstClient ostData={ostData} params={ostParams} />
}
