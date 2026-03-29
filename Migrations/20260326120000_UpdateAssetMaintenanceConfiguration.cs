using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAssetMaintenanceConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add missing foreign key constraints and indexes
            migrationBuilder.Sql(@"
                -- Add foreign key to Assets if it doesn't exist
                IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMaintenance_Assets_AssetId')
                BEGIN
                    ALTER TABLE [AssetMaintenance]
                    ADD CONSTRAINT [FK_AssetMaintenance_Assets_AssetId]
                    FOREIGN KEY ([AssetId]) REFERENCES [Assets] ([Id]);
                END

                -- Add foreign key to Users if it doesn't exist  
                IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMaintenance_Users_CreatedBy')
                BEGIN
                    ALTER TABLE [AssetMaintenance]
                    ADD CONSTRAINT [FK_AssetMaintenance_Users_CreatedBy]
                    FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id]);
                END

                -- Add indexes for better performance
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMaintenance_AssetId')
                BEGIN
                    CREATE NONCLUSTERED INDEX [IX_AssetMaintenance_AssetId] ON [AssetMaintenance] ([AssetId]);
                END

                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMaintenance_MaintenanceDate')
                BEGIN
                    CREATE NONCLUSTERED INDEX [IX_AssetMaintenance_MaintenanceDate] ON [AssetMaintenance] ([MaintenanceDate]);
                END

                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMaintenance_Status')
                BEGIN
                    CREATE NONCLUSTERED INDEX [IX_AssetMaintenance_Status] ON [AssetMaintenance] ([Status]);
                END

                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMaintenance_NextMaintenanceDate')
                BEGIN
                    CREATE NONCLUSTERED INDEX [IX_AssetMaintenance_NextMaintenanceDate] ON [AssetMaintenance] ([NextMaintenanceDate]);
                END

                -- Update column constraints
                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenance]') AND name = 'Currency')
                BEGIN
                    ALTER TABLE [AssetMaintenance] ALTER COLUMN [Currency] NVARCHAR(3) NULL;
                END

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenance]') AND name = 'Description')
                BEGIN
                    ALTER TABLE [AssetMaintenance] ALTER COLUMN [Description] NVARCHAR(500) NOT NULL;
                END

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenance]') AND name = 'PerformedBy')
                BEGIN
                    ALTER TABLE [AssetMaintenance] ALTER COLUMN [PerformedBy] NVARCHAR(200) NULL;
                END

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenance]') AND name = 'TechnicianName')
                BEGIN
                    ALTER TABLE [AssetMaintenance] ALTER COLUMN [TechnicianName] NVARCHAR(200) NULL;
                END

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenance]') AND name = 'CompanyName')
                BEGIN
                    ALTER TABLE [AssetMaintenance] ALTER COLUMN [CompanyName] NVARCHAR(200) NULL;
                END

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenance]') AND name = 'Notes')
                BEGIN
                    ALTER TABLE [AssetMaintenance] ALTER COLUMN [Notes] NVARCHAR(1000) NULL;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove foreign key constraints
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMaintenance_Assets_AssetId')
                BEGIN
                    ALTER TABLE [AssetMaintenance] DROP CONSTRAINT [FK_AssetMaintenance_Assets_AssetId];
                END

                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMaintenance_Users_CreatedBy')
                BEGIN
                    ALTER TABLE [AssetMaintenance] DROP CONSTRAINT [FK_AssetMaintenance_Users_CreatedBy];
                END
            ");

            // Remove indexes
            migrationBuilder.DropIndex(
                name: "IX_AssetMaintenance_AssetId",
                table: "AssetMaintenance");

            migrationBuilder.DropIndex(
                name: "IX_AssetMaintenance_MaintenanceDate", 
                table: "AssetMaintenance");

            migrationBuilder.DropIndex(
                name: "IX_AssetMaintenance_Status",
                table: "AssetMaintenance");

            migrationBuilder.DropIndex(
                name: "IX_AssetMaintenance_NextMaintenanceDate",
                table: "AssetMaintenance");
        }
    }
}