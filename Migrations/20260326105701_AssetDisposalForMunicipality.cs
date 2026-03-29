using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class AssetDisposalForMunicipality : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssetDisposals_Users_PerformedByUserId",
                table: "AssetDisposals");

            migrationBuilder.DropIndex(
                name: "IX_AssetDisposals_PerformedByUserId",
                table: "AssetDisposals");

            migrationBuilder.DropColumn(
                name: "DetailedReason",
                table: "AssetDisposals");

            migrationBuilder.DropColumn(
                name: "DisposalDocumentPath",
                table: "AssetDisposals");

            migrationBuilder.DropColumn(
                name: "DisposalMethod",
                table: "AssetDisposals");

            migrationBuilder.DropColumn(
                name: "HasDocument",
                table: "AssetDisposals");

            migrationBuilder.DropColumn(
                name: "PerformedByUserId",
                table: "AssetDisposals");

            migrationBuilder.CreateIndex(
                name: "IX_AssetDisposals_PerformedBy",
                table: "AssetDisposals",
                column: "PerformedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_AssetDisposals_Users_PerformedBy",
                table: "AssetDisposals",
                column: "PerformedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssetDisposals_Users_PerformedBy",
                table: "AssetDisposals");

            migrationBuilder.DropIndex(
                name: "IX_AssetDisposals_PerformedBy",
                table: "AssetDisposals");

            migrationBuilder.AddColumn<string>(
                name: "DetailedReason",
                table: "AssetDisposals",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DisposalDocumentPath",
                table: "AssetDisposals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisposalMethod",
                table: "AssetDisposals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasDocument",
                table: "AssetDisposals",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PerformedByUserId",
                table: "AssetDisposals",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AssetDisposals_PerformedByUserId",
                table: "AssetDisposals",
                column: "PerformedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AssetDisposals_Users_PerformedByUserId",
                table: "AssetDisposals",
                column: "PerformedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
