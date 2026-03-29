using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyDisposalForMunicipality : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check if columns exist before trying to drop them
            // This migration safely removes columns that were simplified for municipality use
            
            // Remove DetailedReason column if exists (merged into Notes)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_NAME = 'AssetDisposals' AND COLUMN_NAME = 'DetailedReason')
                BEGIN
                    ALTER TABLE AssetDisposals DROP COLUMN DetailedReason;
                END");

            // Remove DisposalMethod column if exists (not needed for municipality)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_NAME = 'AssetDisposals' AND COLUMN_NAME = 'DisposalMethod')
                BEGIN
                    ALTER TABLE AssetDisposals DROP COLUMN DisposalMethod;
                END");

            // Remove document-related columns (simplified for municipality)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_NAME = 'AssetDisposals' AND COLUMN_NAME = 'DisposalDocumentPath')
                BEGIN
                    ALTER TABLE AssetDisposals DROP COLUMN DisposalDocumentPath;
                END");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_NAME = 'AssetDisposals' AND COLUMN_NAME = 'HasDocument')
                BEGIN
                    ALTER TABLE AssetDisposals DROP COLUMN HasDocument;
                END");

            // Ensure Notes column has proper length constraint
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_NAME = 'AssetDisposals' AND COLUMN_NAME = 'Notes')
                BEGIN
                    ALTER TABLE AssetDisposals ALTER COLUMN Notes NVARCHAR(500) NULL;
                END");

            // Update enum values for municipality use
            migrationBuilder.Sql(@"
                -- Update any existing disposal records to use new enum values if needed
                -- This ensures compatibility with the simplified enum
                UPDATE AssetDisposals SET DisposalReason = 99 WHERE DisposalReason NOT IN (1,2,3,4,5,6,7,99);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Add back removed columns for rollback
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

            // Revert Notes column constraint
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