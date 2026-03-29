-- Add Department and Section fields to AssetMovements table

-- Add new columns
ALTER TABLE AssetMovements ADD FromDepartmentId int NULL;
ALTER TABLE AssetMovements ADD FromSectionId int NULL;
ALTER TABLE AssetMovements ADD ToDepartmentId int NULL;
ALTER TABLE AssetMovements ADD ToSectionId int NULL;

-- Add foreign key constraints
ALTER TABLE AssetMovements ADD CONSTRAINT FK_AssetMovements_Departments_FromDepartmentId 
    FOREIGN KEY (FromDepartmentId) REFERENCES Departments(Id);

ALTER TABLE AssetMovements ADD CONSTRAINT FK_AssetMovements_Departments_ToDepartmentId 
    FOREIGN KEY (ToDepartmentId) REFERENCES Departments(Id);

ALTER TABLE AssetMovements ADD CONSTRAINT FK_AssetMovements_Sections_FromSectionId 
    FOREIGN KEY (FromSectionId) REFERENCES Sections(Id);

ALTER TABLE AssetMovements ADD CONSTRAINT FK_AssetMovements_Sections_ToSectionId 
    FOREIGN KEY (ToSectionId) REFERENCES Sections(Id);

-- Add indexes for better performance
CREATE INDEX IX_AssetMovements_FromDepartmentId ON AssetMovements(FromDepartmentId);
CREATE INDEX IX_AssetMovements_FromSectionId ON AssetMovements(FromSectionId);
CREATE INDEX IX_AssetMovements_ToDepartmentId ON AssetMovements(ToDepartmentId);
CREATE INDEX IX_AssetMovements_ToSectionId ON AssetMovements(ToSectionId);