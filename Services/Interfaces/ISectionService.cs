using Assets.DTOs.Section;

namespace Assets.Services.Interfaces;

public interface ISectionService
{
    Task<List<SectionDto>> GetAllAsync(int? departmentId = null);
    Task<SectionDto?> GetByIdAsync(int id);
    Task<SectionDto> CreateAsync(CreateSectionDto dto);
    Task<SectionDto> UpdateAsync(UpdateSectionDto dto);
    Task<bool> DeleteAsync(int id);
}
