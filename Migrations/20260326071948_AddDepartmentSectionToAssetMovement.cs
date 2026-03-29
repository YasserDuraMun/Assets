using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentSectionToAssetMovement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssetMovements_Users_PerformedByUserId",
                table: "AssetMovements");

            migrationBuilder.DropIndex(
                name: "IX_AssetMovements_PerformedByUserId",
                table: "AssetMovements");

            migrationBuilder.DropColumn(
                name: "PerformedByUserId",
                table: "AssetMovements");

            migrationBuilder.AddColumn<int>(
                name: "FromDepartmentId",
                table: "AssetMovements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FromSectionId",
                table: "AssetMovements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ToDepartmentId",
                table: "AssetMovements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ToSectionId",
                table: "AssetMovements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "AssetMovements",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_FromDepartmentId",
                table: "AssetMovements",
                column: "FromDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_FromSectionId",
                table: "AssetMovements",
                column: "FromSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_PerformedBy",
                table: "AssetMovements",
                column: "PerformedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_ToDepartmentId",
                table: "AssetMovements",
                column: "ToDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_ToSectionId",
                table: "AssetMovements",
                column: "ToSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_UserId",
                table: "AssetMovements",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMovements_Departments_FromDepartmentId",
                table: "AssetMovements",
                column: "FromDepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMovements_Departments_ToDepartmentId",
                table: "AssetMovements",
                column: "ToDepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMovements_Sections_FromSectionId",
                table: "AssetMovements",
                column: "FromSectionId",
                principalTable: "Sections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMovements_Sections_ToSectionId",
                table: "AssetMovements",
                column: "ToSectionId",
                principalTable: "Sections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMovements_Users_PerformedBy",
                table: "AssetMovements",
                column: "PerformedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMovements_Users_UserId",
                table: "AssetMovements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssetMovements_Departments_FromDepartmentId",
                table: "AssetMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMovements_Departments_ToDepartmentId",
                table: "AssetMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMovements_Sections_FromSectionId",
                table: "AssetMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMovements_Sections_ToSectionId",
                table: "AssetMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMovements_Users_PerformedBy",
                table: "AssetMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_AssetMovements_Users_UserId",
                table: "AssetMovements");

            migrationBuilder.DropIndex(
                name: "IX_AssetMovements_FromDepartmentId",
                table: "AssetMovements");

            migrationBuilder.DropIndex(
                name: "IX_AssetMovements_FromSectionId",
                table: "AssetMovements");

            migrationBuilder.DropIndex(
                name: "IX_AssetMovements_PerformedBy",
                table: "AssetMovements");

            migrationBuilder.DropIndex(
                name: "IX_AssetMovements_ToDepartmentId",
                table: "AssetMovements");

            migrationBuilder.DropIndex(
                name: "IX_AssetMovements_ToSectionId",
                table: "AssetMovements");

            migrationBuilder.DropIndex(
                name: "IX_AssetMovements_UserId",
                table: "AssetMovements");

            migrationBuilder.DropColumn(
                name: "FromDepartmentId",
                table: "AssetMovements");

            migrationBuilder.DropColumn(
                name: "FromSectionId",
                table: "AssetMovements");

            migrationBuilder.DropColumn(
                name: "ToDepartmentId",
                table: "AssetMovements");

            migrationBuilder.DropColumn(
                name: "ToSectionId",
                table: "AssetMovements");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "AssetMovements");

            migrationBuilder.AddColumn<int>(
                name: "PerformedByUserId",
                table: "AssetMovements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_PerformedByUserId",
                table: "AssetMovements",
                column: "PerformedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AssetMovements_Users_PerformedByUserId",
                table: "AssetMovements",
                column: "PerformedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
