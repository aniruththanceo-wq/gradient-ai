from __future__ import annotations

from pydantic import BaseModel


class ReportRead(BaseModel):
    id: str
    report_type: str
    title: str
    file_path: str
    download_url: str

