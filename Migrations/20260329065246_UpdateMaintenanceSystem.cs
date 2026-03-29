using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMaintenanceSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssetMaintenances_Assets_AssetId",
                table: "AssetMaintenances");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMaintenances_Users_CreatorId",
                table: "AssetMaintenances");

            migrationBuilder.DropIndex(
                name: "IX_AssetMaintenances_CreatorId",
                table: "AssetMaintenances");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "AssetMaintenances");

            migrationBuilder.RenameIndex(
                name: "IX_AssetMaintenances_AssetId",
                table: "AssetMaintenances",
                newName: "IX_AssetMaintenance_AssetId");

            migrationBuilder.AlterColumn<string>(
                name: "TechnicianName",
                table: "AssetMaintenances",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PerformedBy",
                table: "AssetMaintenances",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "AssetMaintenances",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "AssetMaintenances",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "AssetMaintenances",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CompanyName",
                table: "AssetMaintenances",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetMaintenance_MaintenanceDate",
                table: "AssetMaintenances",
                column: "MaintenanceDate");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMaintenance_NextMaintenanceDate",
                table: "AssetMaintenances",
                column: "NextMaintenanceDate");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMaintenance_Status",
                table: "AssetMaintenances",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMaintenances_CreatedBy",
                table: "AssetMaintenances",
                column: "CreatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMaintenances_Assets_AssetId",
                table: "AssetMaintenances",
                column: "AssetId",
                principalTable: "Assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMaintenances_Users_CreatedBy",
                table: "AssetMaintenances",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssetMaintenances_Assets_AssetId",
                table: "AssetMaintenances");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMaintenances_Users_CreatedBy",
                table: "AssetMaintenances");

            migrationBuilder.DropIndex(
                name: "IX_AssetMaintenance_MaintenanceDate",
                table: "AssetMaintenances");

            migrationBuilder.DropIndex(
                name: "IX_AssetMaintenance_NextMaintenanceDate",
                table: "AssetMaintenances");

            migrationBuilder.DropIndex(
                name: "IX_AssetMaintenance_Status",
                table: "AssetMaintenances");

            migrationBuilder.DropIndex(
                name: "IX_AssetMaintenances_CreatedBy",
                table: "AssetMaintenances");

            migrationBuilder.RenameIndex(
                name: "IX_AssetMaintenance_AssetId",
                table: "AssetMaintenances",
                newName: "IX_AssetMaintenances_AssetId");

            migrationBuilder.AlterColumn<string>(
                name: "TechnicianName",
                table: "AssetMaintenances",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PerformedBy",
                table: "AssetMaintenances",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "AssetMaintenances",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "AssetMaintenances",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "AssetMaintenances",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(3)",
                oldMaxLength: 3);

            migrationBuilder.AlterColumn<string>(
                name: "CompanyName",
                table: "AssetMaintenances",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatorId",
                table: "AssetMaintenances",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AssetMaintenances_CreatorId",
                table: "AssetMaintenances",
                column: "CreatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMaintenances_Assets_AssetId",
                table: "AssetMaintenances",
                column: "AssetId",
                principalTable: "Assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMaintenances_Users_CreatorId",
                table: "AssetMaintenances",
                column: "CreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
