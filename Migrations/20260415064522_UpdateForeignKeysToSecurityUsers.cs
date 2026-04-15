using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class UpdateForeignKeysToSecurityUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // حذف العلاقات القديمة مع جدول Users
            migrationBuilder.DropForeignKey(
                name: "FK_AssetDisposals_Users_PerformedBy",
                table: "AssetDisposals");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMaintenances_Users_CreatedBy",
                table: "AssetMaintenances");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMovements_Users_PerformedBy",
                table: "AssetMovements");

            // إضافة العلاقات الجديدة مع جدول SecurityUsers
            migrationBuilder.AddForeignKey(
                name: "FK_AssetDisposals_SecurityUsers_PerformedBy",
                table: "AssetDisposals",
                column: "PerformedBy",
                principalTable: "SecurityUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMaintenances_SecurityUsers_CreatedBy",
                table: "AssetMaintenances",
                column: "CreatedBy",
                principalTable: "SecurityUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMovements_SecurityUsers_PerformedBy",
                table: "AssetMovements",
                column: "PerformedBy",
                principalTable: "SecurityUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // التراجع: حذف العلاقات مع SecurityUsers
            migrationBuilder.DropForeignKey(
                name: "FK_AssetDisposals_SecurityUsers_PerformedBy",
                table: "AssetDisposals");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMaintenances_SecurityUsers_CreatedBy",
                table: "AssetMaintenances");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMovements_SecurityUsers_PerformedBy",
                table: "AssetMovements");

            // إعادة إضافة العلاقات القديمة مع Users
            migrationBuilder.AddForeignKey(
                name: "FK_AssetDisposals_Users_PerformedBy",
                table: "AssetDisposals",
                column: "PerformedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMaintenances_Users_CreatedBy",
                table: "AssetMaintenances",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMovements_Users_PerformedBy",
                table: "AssetMovements",
                column: "PerformedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
