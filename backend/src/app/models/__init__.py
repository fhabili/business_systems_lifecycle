# Import all models here so that Base.metadata knows about every table.
# Alembic reads this file to understand what the database should look like.
from app.models.staging import FileLoad, EcbSupRaw, BistaRaw, BisLbsRaw, EcbEurosystemRaw
from app.models.warehouse import BankLcr, BankNsfr, SupervisorySeries
from app.models.lineage import PipelineRun, LayerEvent
from app.models.validation import RuleDefinition, RuleResult
from app.models.dimensions import DimEntity, DimPeriod, DimMetric, DimSource

__all__ = [
    "FileLoad", "EcbSupRaw", "BistaRaw", "BisLbsRaw", "EcbEurosystemRaw",
    "BankLcr", "BankNsfr", "SupervisorySeries",
    "PipelineRun", "LayerEvent",
    "RuleDefinition", "RuleResult",
    "DimEntity", "DimPeriod", "DimMetric", "DimSource",
]
