import http from "./request";
import type { ArchiveResponse } from "@/types";
import type { ResponseData } from "@/types/api";
import type { ladyArticleParams } from "@/types/article";
import { jAccess } from "@/utils/cabinet";
import ResponseFactory from "@/utils/responseFactory";

const jMake = jAccess('AR')

export const getArchive = async ({ year, month, limit = 5 }:
  { year?: number; month?: number, limit?: number }): Promise<ResponseData<ArchiveResponse>> => {
  let result = ResponseFactory.success<ArchiveResponse>({} as ArchiveResponse)

  const response = await http.get(jMake(`/list`), { year, month, limit })
  if (response.data) {
    result = response.data as ResponseData<ArchiveResponse>
  }

  return result
}

export const getArchiveMore = async (
  {
    years,
    startYear,
    endYear,
    limit = 5
  }: ladyArticleParams): Promise<ResponseData<ArchiveResponse>> => {
  let result = ResponseFactory.success<ArchiveResponse>({} as ArchiveResponse)

  const response = await http.get(jMake(`/more`), { years, startYear, endYear, limit })
  if (response.data) {
    result = response.data as ResponseData<ArchiveResponse>
  }

  return result
}
