-- Simplify AssetDisposal Model - Remove unused columns for municipality use
-- Run this if Update-Database fails

USE [AssetsManagement];

-- Check if columns exist before dropping them
IF COL_LENGTH('AssetDisposals', 'DetailedReason') IS NOT NULL
BEGIN
    ALTER TABLE AssetDisposals DROP COLUMN DetailedReason;
END

IF COL_LENGTH('AssetDisposals', 'DisposalMethod') IS NOT NULL
BEGIN
    ALTER TABLE AssetDisposals DROP COLUMN DisposalMethod;
END

IF COL_LENGTH('AssetDisposals', 'DisposalDocumentPath') IS NOT NULL
BEGIN
    ALTER TABLE AssetDisposals DROP COLUMN DisposalDocumentPath;
END

IF COL_LENGTH('AssetDisposals', 'HasDocument') IS NOT NULL
BEGIN
    ALTER TABLE AssetDisposals DROP COLUMN HasDocument;
END

-- Ensure Notes column has proper constraints
IF COL_LENGTH('AssetDisposals', 'Notes') IS NOT NULL
BEGIN
    ALTER TABLE AssetDisposals ALTER COLUMN Notes NVARCHAR(500) NULL;
END

PRINT 'AssetDisposal model simplified successfully for municipality use.';