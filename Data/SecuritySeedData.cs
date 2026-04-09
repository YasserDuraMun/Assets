using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.Models.Security;
using BCrypt.Net;

namespace Assets.Data
{
    public static class SecuritySeedData
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // ???? ?? ???? ????? ????????
            await context.Database.EnsureCreatedAsync();

            // ????? ??????? ????????
            if (!await context.Roles.AnyAsync())
            {
                var roles = new List<Role>
                {
                    new Role { RoleName = "Super Admin", IsActive = true },
                    new Role { RoleName = "Admin", IsActive = true },
                    new Role { RoleName = "Manager", IsActive = true },
                    new Role { RoleName = "Employee", IsActive = true },
                    new Role { RoleName = "Viewer", IsActive = true }
                };

                context.Roles.AddRange(roles);
                await context.SaveChangesAsync();
            }

            // ????? ??????? ????????
            if (!await context.Screens.AnyAsync())
            {
                var screens = new List<Screen>
                {
                    new Screen { ScreenName = "Dashboard", SType = "Main", Hint = "?????? ????????" },
                    new Screen { ScreenName = "Assets", SType = "Management", Hint = "????? ??????" },
                    new Screen { ScreenName = "Users", SType = "Security", Hint = "????? ??????????" },
                    new Screen { ScreenName = "Roles", SType = "Security", Hint = "????? ???????" },
                    new Screen { ScreenName = "Permissions", SType = "Security", Hint = "????? ?????????" },
                    new Screen { ScreenName = "Categories", SType = "Management", Hint = "???? ??????" },
                    new Screen { ScreenName = "Departments", SType = "Management", Hint = "???????" },
                    new Screen { ScreenName = "Employees", SType = "Management", Hint = "????????" },
                    new Screen { ScreenName = "Warehouses", SType = "Management", Hint = "???????" },
                    new Screen { ScreenName = "Transfers", SType = "Operations", Hint = "??? ??????" },
                    new Screen { ScreenName = "Maintenance", SType = "Operations", Hint = "????? ??????" },
                    new Screen { ScreenName = "Disposal", SType = "Operations", Hint = "??????? ??????" },
                    new Screen { ScreenName = "Reports", SType = "Reports", Hint = "????????" }
                };

                context.Screens.AddRange(screens);
                await context.SaveChangesAsync();
            }

            // ????? ???????? ????????? (Super Admin)
            if (!await context.SecurityUsers.AnyAsync())
            {
                var superAdminUser = new User
                {
                    FullName = "haya zeer",
                    Email = "admin@assets.ps", // ?????? ?????????? ?????? ??????? ?? ????? ????????
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.SecurityUsers.Add(superAdminUser);
                await context.SaveChangesAsync();

                // ??? ???????? ???? Super Admin
                var superAdminRole = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Super Admin");
                if (superAdminRole != null)
                {
                    var userRole = new UserRole
                    {
                        UserId = superAdminUser.Id,
                        RoleId = superAdminRole.RoleId,
                        AssignedAt = DateTime.UtcNow
                    };

                    context.UserRoles.Add(userRole);
                    await context.SaveChangesAsync();
                }
            }

            // ????? ??????? ???????? ???? Super Admin
            var superAdmin = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Super Admin");
            if (superAdmin != null && !await context.Permissions.AnyAsync(p => p.RoleID == superAdmin.RoleId))
            {
                var screens = await context.Screens.ToListAsync();
                var permissions = new List<Permission>();

                foreach (var screen in screens)
                {
                    permissions.Add(new Permission
                    {
                        RoleID = superAdmin.RoleId,
                        ScreenID = screen.ScreenID,
                        AllowView = true,
                        AllowInsert = true,
                        AllowUpdate = true,
                        AllowDelete = true
                    });
                }

                context.Permissions.AddRange(permissions);
                await context.SaveChangesAsync();
            }

            // ????? ??????? ???????? ???? Admin
            var admin = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Admin");
            if (admin != null && !await context.Permissions.AnyAsync(p => p.RoleID == admin.RoleId))
            {
                var screens = await context.Screens.ToListAsync();
                var permissions = new List<Permission>();

                foreach (var screen in screens)
                {
                    // Admin can do everything except delete users and roles
                    var allowDelete = !(screen.ScreenName == "Users" || screen.ScreenName == "Roles");
                    
                    permissions.Add(new Permission
                    {
                        RoleID = admin.RoleId,
                        ScreenID = screen.ScreenID,
                        AllowView = true,
                        AllowInsert = true,
                        AllowUpdate = true,
                        AllowDelete = allowDelete
                    });
                }

                context.Permissions.AddRange(permissions);
                await context.SaveChangesAsync();
            }

            // ????? ??????? ???????? ???? Manager
            var manager = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Manager");
            if (manager != null && !await context.Permissions.AnyAsync(p => p.RoleID == manager.RoleId))
            {
                var screens = await context.Screens.ToListAsync();
                var permissions = new List<Permission>();

                foreach (var screen in screens)
                {
                    // Manager cannot access security screens
                    var isSecurityScreen = screen.SType == "Security";
                    
                    if (!isSecurityScreen)
                    {
                        permissions.Add(new Permission
                        {
                            RoleID = manager.RoleId,
                            ScreenID = screen.ScreenID,
                            AllowView = true,
                            AllowInsert = true,
                            AllowUpdate = true,
                            AllowDelete = screen.ScreenName != "Reports" // Can't delete reports
                        });
                    }
                }

                context.Permissions.AddRange(permissions);
                await context.SaveChangesAsync();
            }

            // ????? ??????? ???????? ???? Employee
            var employee = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Employee");
            if (employee != null && !await context.Permissions.AnyAsync(p => p.RoleID == employee.RoleId))
            {
                var screens = await context.Screens.Where(s => s.ScreenName == "Dashboard" || 
                                                             s.ScreenName == "Assets" || 
                                                             s.ScreenName == "Transfers" ||
                                                             s.ScreenName == "Maintenance").ToListAsync();
                var permissions = new List<Permission>();

                foreach (var screen in screens)
                {
                    permissions.Add(new Permission
                    {
                        RoleID = employee.RoleId,
                        ScreenID = screen.ScreenID,
                        AllowView = true,
                        AllowInsert = screen.ScreenName == "Transfers" || screen.ScreenName == "Maintenance",
                        AllowUpdate = screen.ScreenName == "Assets",
                        AllowDelete = false
                    });
                }

                context.Permissions.AddRange(permissions);
                await context.SaveChangesAsync();
            }

            // ????? ??????? ???????? ???? Viewer
            var viewer = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Viewer");
            if (viewer != null && !await context.Permissions.AnyAsync(p => p.RoleID == viewer.RoleId))
            {
                var screens = await context.Screens.Where(s => s.SType != "Security").ToListAsync();
                var permissions = new List<Permission>();

                foreach (var screen in screens)
                {
                    permissions.Add(new Permission
                    {
                        RoleID = viewer.RoleId,
                        ScreenID = screen.ScreenID,
                        AllowView = true,
                        AllowInsert = false,
                        AllowUpdate = false,
                        AllowDelete = false
                    });
                }

                context.Permissions.AddRange(permissions);
                await context.SaveChangesAsync();
            }
        }
    }
}