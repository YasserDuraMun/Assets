using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAssetStatusDefaultDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE AssetStatuses 
                SET CreatedAt = GETUTCDATE() 
                WHERE CreatedAt IS NULL OR CreatedAt = '0001-01-01T00:00:00'
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No rollback needed
        }
    }
}