using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class FixAssetMaintenanceForeignKeyToSecurityUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the existing foreign key constraint pointing to wrong table
            migrationBuilder.DropForeignKey(
                name: "FK_AssetMaintenances_Users_CreatedBy",
                table: "AssetMaintenances");

            // Create the correct foreign key constraint pointing to SecurityUsers
            migrationBuilder.AddForeignKey(
                name: "FK_AssetMaintenances_SecurityUsers_CreatedBy",
                table: "AssetMaintenances",
                column: "CreatedBy",
                principalTable: "SecurityUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse the changes
            migrationBuilder.DropForeignKey(
                name: "FK_AssetMaintenances_SecurityUsers_CreatedBy",
                table: "AssetMaintenances");

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMaintenances_Users_CreatedBy",
                table: "AssetMaintenances",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}