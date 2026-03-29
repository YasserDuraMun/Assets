using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyAssetDisposalModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove columns that no longer exist
            migrationBuilder.DropColumn(
                name: "DetailedReason",
                table: "AssetDisposals");

            migrationBuilder.DropColumn(
                name: "DisposalMethod",
                table: "AssetDisposals");

            migrationBuilder.DropColumn(
                name: "DisposalDocumentPath",
                table: "AssetDisposals");

            migrationBuilder.DropColumn(
                name: "HasDocument",
                table: "AssetDisposals");

            // Notes column should already exist, but ensure it's nullable
            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "AssetDisposals",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Add back removed columns
            migrationBuilder.AddColumn<string>(
                name: "DetailedReason",
                table: "AssetDisposals",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DisposalMethod",
                table: "AssetDisposals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisposalDocumentPath",
                table: "AssetDisposals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasDocument",
                table: "AssetDisposals",
                type: "bit",
                nullable: false,
                defaultValue: false);

            // Revert Notes column
            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "AssetDisposals",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);
        }
    }
}