using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrentSectionIdToAsset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentSectionId",
                table: "Assets",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$K3vZK3vZK3vZK3vZK3vZKOe5YqM8vJxVnRZjqJqJqJqJe7KzM8vJxVm");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_CurrentSectionId",
                table: "Assets",
                column: "CurrentSectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Sections_CurrentSectionId",
                table: "Assets",
                column: "CurrentSectionId",
                principalTable: "Sections",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Sections_CurrentSectionId",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_CurrentSectionId",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "CurrentSectionId",
                table: "Assets");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$7bXZ9h5F2g.xQK4kK4X8m.H0XU9vYZKZH5k5P5M5N5O5Q5R5S5T5U");
        }
    }
}
