-- Roomward — Migration 012
-- Real-world scale for floor plans.
--
-- The floor builder already draws rooms on a proportional grid (each room is
-- W×H cells). Adding one number per floor — feet per grid cell — makes the
-- whole plan dimensionally accurate: every room gets a computed square
-- footage (W·scale × H·scale), floors get totals, and the UI can show a
-- scale bar like an architectural drawing.
--
-- spaces.sq_ft overrides the computed value for rooms where the real number
-- is known (computed = cells are an approximation of an irregular room).

alter table floors add column if not exists scale_ft_per_cell numeric(6,2);
alter table spaces add column if not exists sq_ft numeric(8,1);

comment on column floors.scale_ft_per_cell is 'Feet represented by one grid cell edge; null = no scale set';
comment on column spaces.sq_ft is 'Manual square-footage override; null = computed from cells × floor scale';
