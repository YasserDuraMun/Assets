using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class AddAssetNameEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssetNameId",
                table: "Assets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AssetNames",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SubCategoryId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetNames", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetNames_AssetSubCategories_SubCategoryId",
                        column: x => x.SubCategoryId,
                        principalTable: "AssetSubCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assets_AssetNameId",
                table: "Assets",
                column: "AssetNameId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetNames_SubCategoryId",
                table: "AssetNames",
                column: "SubCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_AssetNames_AssetNameId",
                table: "Assets",
                column: "AssetNameId",
                principalTable: "AssetNames",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assets_AssetNames_AssetNameId",
                table: "Assets");

            migrationBuilder.DropTable(
                name: "AssetNames");

            migrationBuilder.DropIndex(
                name: "IX_Assets_AssetNameId",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "AssetNameId",
                table: "Assets");
        }
    }
}
