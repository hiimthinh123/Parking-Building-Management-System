-- Required seed data for Parking Building Management System
-- Run after schema.sql.
USE [system_database]
GO

-- VehicleTypes

INSERT [dbo].[VehicleTypes] ([VehicleTypeID], [TypeName]) VALUES (1, N'Xe máy')
GO

INSERT [dbo].[VehicleTypes] ([VehicleTypeID], [TypeName]) VALUES (2, N'Ô tô')
GO

-- Roles

SET IDENTITY_INSERT [dbo].[Roles] ON
GO

INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (1, N'Admin')
GO

INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (2, N'Manager')
GO

INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (3, N'Staff')
GO

INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (4, N'Driver')
GO

SET IDENTITY_INSERT [dbo].[Roles] OFF
GO

-- Permissions

SET IDENTITY_INSERT [dbo].[Permissions] ON
GO

INSERT [dbo].[Permissions] ([PermissionID], [PermissionKey], [PermissionName], [Icon]) VALUES (1, N'manage_users', N'Quản lý tài khoản người dùng', N'fa-solid fa-users-gear')
GO

INSERT [dbo].[Permissions] ([PermissionID], [PermissionKey], [PermissionName], [Icon]) VALUES (2, N'manage_perms', N'Cấu hình phân quyền hệ thống', N'fa-solid fa-shield-halved')
GO

INSERT [dbo].[Permissions] ([PermissionID], [PermissionKey], [PermissionName], [Icon]) VALUES (3, N'config_tariff', N'Thiết lập cấu hình bảng giá bãi xe', N'fa-solid fa-sliders')
GO

INSERT [dbo].[Permissions] ([PermissionID], [PermissionKey], [PermissionName], [Icon]) VALUES (4, N'dispatch', N'Điều phối tạo ca xe vào/ra bốt bảo vệ', N'fa-solid fa-square-p')
GO

INSERT [dbo].[Permissions] ([PermissionID], [PermissionKey], [PermissionName], [Icon]) VALUES (5, N'booking', N'Đặt vị trí đỗ trước (Booking slot)', N'fa-regular fa-calendar-check')
GO

INSERT [dbo].[Permissions] ([PermissionID], [PermissionKey], [PermissionName], [Icon]) VALUES (6, N'reports', N'Xem báo cáo thống kê & Doanh thu', N'fa-solid fa-chart-line')
GO

SET IDENTITY_INSERT [dbo].[Permissions] OFF
GO

-- Users

SET IDENTITY_INSERT [dbo].[Users] ON
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (1, 1, N'admin1', N'123', N'Nguyễn Văn Admin', N'0901234567', N'admin@parking.com', CAST(N'2026-07-18T15:55:37.680' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (2, 2, N'manager1', N'123', N'Trần Thị Quản Lý', N'0912345678', N'manager@parking.com', CAST(N'2026-07-18T15:55:37.680' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (3, 3, N'staff1', N'123', N'Lê Hoàng Nhân Viên', N'0923456789', N'staff@parking.com', CAST(N'2026-07-18T15:55:37.680' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (4, 4, N'driver1', N'123', N'Phạm Minh Tài Xế', N'0934567890', N'driver@parking.com', CAST(N'2026-07-18T15:55:37.680' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (5, 4, N'driver2', N'123', N'Hoàng Đức Thịnh', N'0945678901', N'thinh@gmail.com', CAST(N'2026-07-18T15:55:37.680' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (8, 4, N'driver3', N'123456', N'Thinh', N'0123456789', NULL, CAST(N'2026-07-18T22:51:12.647' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (9, 4, N'thinh123', N'123456', N'Nguyen Duc Thinh', N'0326133968', N'hiimthinhbear@gmail.com', CAST(N'2026-07-29T17:07:43.190' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (10, 4, N'thinh8386', N'123456', N'Nguyen Duc Thinh', N'0793850689', N'hiimthinh123@gmail.com', CAST(N'2026-07-30T22:42:30.297' AS DateTime), 0)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (11, 4, N'cochi', N'123456', N'Chi', N'0933434599', N'chi@gmail.com', CAST(N'2026-07-31T16:17:44.707' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (12, 1, N'codtest_admin', N'Test@123456', N'CODTEST Admin', N'0900000001', N'codtest.admin@example.com', CAST(N'2026-08-05T10:30:56.920' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (13, 2, N'codtest_manager', N'Test@123456', N'CODTEST Manager', N'0900000002', N'codtest.manager@example.com', CAST(N'2026-08-05T10:30:56.927' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (14, 3, N'codtest_staff', N'Test@123456', N'CODTEST Staff', N'0900000003', N'codtest.staff@example.com', CAST(N'2026-08-05T10:30:56.927' AS DateTime), 1)
GO

INSERT [dbo].[Users] ([UserID], [RoleID], [Username], [PasswordHash], [FullName], [PhoneNumber], [Email], [CreatedAt], [Status]) VALUES (15, 4, N'codtest_driver', N'Test@123456', N'CODTEST Driver', N'0900000004', N'codtest.driver@example.com', CAST(N'2026-08-05T10:30:56.927' AS DateTime), 1)
GO

SET IDENTITY_INSERT [dbo].[Users] OFF
GO

-- Floors

SET IDENTITY_INSERT [dbo].[Floors] ON
GO

INSERT [dbo].[Floors] ([FloorID], [VehicleTypeID], [FloorName], [MaxCapacity]) VALUES (1, 2, N'Tầng G - Ô Tô', 10)
GO

INSERT [dbo].[Floors] ([FloorID], [VehicleTypeID], [FloorName], [MaxCapacity]) VALUES (2, 1, N'Tầng 1 - Xe Máy', 20)
GO

SET IDENTITY_INSERT [dbo].[Floors] OFF
GO

-- Slots

SET IDENTITY_INSERT [dbo].[Slots] ON
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (1, 1, N'XM-G01', N'Occupied', N'72H-11111', NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (2, 1, N'XM-G02', N'Occupied', N'72H12345', NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (3, 1, N'XM-G03', N'Occupied', N'001H', NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (4, 1, N'XM-G04', N'Occupied', N'002H', NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (5, 1, N'XM-G05', N'Occupied', N'003H', NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (6, 2, N'OT-101', N'Occupied', N'72H-99999', NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (7, 2, N'OT-102', N'Occupied', N'005H', NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (8, 2, N'OT-103', N'Available', NULL, NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (9, 2, N'OT-104', N'Available', NULL, NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (10, 2, N'OT-105', N'Available', N'72H-12345', NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (16, 1, N'NEW', N'Occupied', N'004H', NULL)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (19, 1, N'OT-CODTEST-01', N'Available', NULL, 0)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (20, 1, N'OT-CODTEST-02', N'Available', NULL, 0)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (21, 2, N'XM-CODTEST-01', N'Available', NULL, 0)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (22, 2, N'XM-CODTEST-02', N'Available', NULL, 0)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (23, 1, N'XM-CODTEST-DUP', N'Available', NULL, 0)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (25, 1, N'OT-CODTEST-DUP-F1', N'Available', NULL, 0)
GO

INSERT [dbo].[Slots] ([SlotID], [FloorID], [SlotCode], [Status], [CurrentVehiclePlate], [IsDeleted]) VALUES (26, 2, N'XM-CODTEST-DUP-F2', N'Available', NULL, 0)
GO

SET IDENTITY_INSERT [dbo].[Slots] OFF
GO

-- PricePolicies

SET IDENTITY_INSERT [dbo].[PricePolicies] ON
GO

INSERT [dbo].[PricePolicies] ([BasePrice], [EffectiveDate], [HourlyRate], [LostTicketPenalty], [OvertimeRate], [PolicyID], [VehicleTypeID]) VALUES (5000, CAST(N'2026-07-22' AS Date), 3000, 50000, 10000, 1, 1)
GO

INSERT [dbo].[PricePolicies] ([BasePrice], [EffectiveDate], [HourlyRate], [LostTicketPenalty], [OvertimeRate], [PolicyID], [VehicleTypeID]) VALUES (10000, CAST(N'2026-07-22' AS Date), 5000, 100000, 20000, 2, 2)
GO

SET IDENTITY_INSERT [dbo].[PricePolicies] OFF
GO

-- RolePermission

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (1, 1)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (1, 2)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (1, 3)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (1, 4)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (1, 5)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (1, 6)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (2, 3)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (2, 4)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (2, 5)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (2, 6)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (3, 4)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (3, 5)
GO

INSERT [dbo].[RolePermission] ([RoleID], [PermissionID]) VALUES (4, 5)
GO
