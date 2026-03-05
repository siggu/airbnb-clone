export function getErrorDetail(error: any): string {
  const data = error?.response?.data;
  if (data) {
    // DRF 필드 에러 (첫 번째 필드의 첫 번째 메시지)
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (Array.isArray(val) && val.length > 0) return val[0];
      if (typeof val === "string") return val;
    }
  }
  return error?.message || "알 수 없는 오류가 발생했습니다.";
}
