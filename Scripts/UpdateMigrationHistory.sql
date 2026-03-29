-- Add migration record to EF history after manual setup
USE [AssetsManagement];

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES ('20260326082000_SimplifyDisposalForMunicipality', '9.0.0');

PRINT 'Migration history updated successfully.';