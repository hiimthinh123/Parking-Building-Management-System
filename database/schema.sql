-- Schema for Parking Building Management System
-- Run after creating and selecting database [system_database].
USE [system_database]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Bookings](
	[BookingID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[GuestToken] [varchar](80) NULL,
	[GuestName] [nvarchar](100) NULL,
	[GuestPhone] [varchar](30) NULL,
	[LicensePlate] [varchar](30) NOT NULL,
	[SlotID] [int] NOT NULL,
	[StartTime] [datetime] NOT NULL,
	[EndTime] [datetime] NOT NULL,
	[Status] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[BookingID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Feedbacks](
	[FeedbackID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[AssignedTo] [varchar](30) NULL,
	[GuestPhone] [varchar](30) NULL,
	[LicensePlate] [varchar](30) NULL,
	[Status] [varchar](30) NULL,
	[Category] [varchar](50) NULL,
	[GuestToken] [varchar](80) NULL,
	[GuestName] [varchar](100) NULL,
	[Description] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[FeedbackID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Floors](
	[FloorID] [int] IDENTITY(1,1) NOT NULL,
	[VehicleTypeID] [int] NOT NULL,
	[FloorName] [nvarchar](50) NOT NULL,
	[MaxCapacity] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[FloorID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[IncidentReports](
	[AssignedSlotID] [int] NULL,
	[IncidentID] [int] IDENTITY(1,1) NOT NULL,
	[PenaltyAmount] [real] NULL,
	[SessionID] [int] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[ResolvedAt] [datetime2](7) NULL,
	[ActualSlotCode] [varchar](30) NULL,
	[LicensePlate] [varchar](30) NULL,
	[Status] [varchar](30) NULL,
	[IncidentType] [varchar](50) NULL,
	[CreatedBy] [varchar](80) NULL,
	[EvidenceNote] [varchar](1000) NULL,
	[ResolutionNote] [varchar](1000) NULL,
PRIMARY KEY CLUSTERED 
(
	[IncidentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ParkingSessions](
	[SessionID] [int] IDENTITY(1,1) NOT NULL,
	[SlotID] [int] NOT NULL,
	[VehicleTypeID] [int] NOT NULL,
	[BookingID] [int] NULL,
	[UserID] [int] NULL,
	[GuestToken] [varchar](80) NULL,
	[LicensePlate] [varchar](255) NULL,
	[CardNumber] [varchar](255) NULL,
	[CheckInTime] [datetime] NOT NULL,
	[CheckOutTime] [datetime] NULL,
	[ImageInUrl] [varchar](255) NULL,
	[ImageOutUrl] [varchar](255) NULL,
	[SessionStatus] [varchar](255) NULL,
	[ExceptionType] [varchar](255) NULL,
	[BarrierStatus] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[SessionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Payments](
	[Amount] [real] NULL,
	[BookingID] [int] NULL,
	[PaymentID] [int] IDENTITY(1,1) NOT NULL,
	[SessionID] [int] NULL,
	[PaymentTime] [datetime2](7) NULL,
	[GuestToken] [varchar](80) NULL,
	[OrderId] [varchar](100) NULL,
	[PaymentLinkId] [varchar](100) NULL,
	[QrCode] [text] NULL,
	[PaymentMethod] [varchar](255) NULL,
	[Status] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[PaymentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Permissions](
	[PermissionID] [int] IDENTITY(1,1) NOT NULL,
	[PermissionKey] [varchar](100) NOT NULL,
	[PermissionName] [nvarchar](150) NOT NULL,
	[Icon] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[PermissionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PricePolicies](
	[BasePrice] [real] NULL,
	[EffectiveDate] [date] NULL,
	[HourlyRate] [real] NULL,
	[LostTicketPenalty] [real] NULL,
	[OvertimeRate] [real] NULL,
	[PolicyID] [int] IDENTITY(1,1) NOT NULL,
	[VehicleTypeID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[PolicyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[RolePermission](
	[RoleID] [int] NOT NULL,
	[PermissionID] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RoleID] ASC,
	[PermissionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Roles](
	[RoleID] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RoleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Slots](
	[SlotID] [int] IDENTITY(1,1) NOT NULL,
	[FloorID] [int] NOT NULL,
	[SlotCode] [varchar](255) NULL,
	[Status] [varchar](255) NULL,
	[CurrentVehiclePlate] [varchar](255) NULL,
	[IsDeleted] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[SlotID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[RoleID] [int] NOT NULL,
	[Username] [varchar](50) NOT NULL,
	[PasswordHash] [varchar](255) NOT NULL,
	[FullName] [nvarchar](100) NULL,
	[PhoneNumber] [varchar](15) NULL,
	[Email] [varchar](100) NULL,
	[CreatedAt] [datetime] NULL,
	[Status] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[VehicleTypes](
	[VehicleTypeID] [int] NOT NULL,
	[TypeName] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[VehicleTypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO

SET ANSI_PADDING ON
GO

SET ANSI_PADDING ON
GO

SET ANSI_PADDING ON
GO

SET ANSI_PADDING ON
GO

SET ANSI_PADDING ON
GO

SET ANSI_PADDING ON
GO

SET ANSI_PADDING ON
GO

SET ANSI_PADDING ON
GO

SET ANSI_PADDING ON
GO

ALTER TABLE [dbo].[Bookings] ADD  DEFAULT ('Confirmed') FOR [Status]
GO

ALTER TABLE [dbo].[Floors] ADD  DEFAULT ((0)) FOR [MaxCapacity]
GO

ALTER TABLE [dbo].[ParkingSessions] ADD  DEFAULT (getdate()) FOR [CheckInTime]
GO

ALTER TABLE [dbo].[ParkingSessions] ADD  DEFAULT ('Active') FOR [SessionStatus]
GO

ALTER TABLE [dbo].[ParkingSessions] ADD  DEFAULT ('LOCKED') FOR [BarrierStatus]
GO

ALTER TABLE [dbo].[Slots] ADD  DEFAULT ('Available') FOR [Status]
GO

ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO

ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [Status]
GO

ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD  CONSTRAINT [FK_Bookings_Slot] FOREIGN KEY([SlotID])
REFERENCES [dbo].[Slots] ([SlotID])
GO

ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_Slot]
GO

ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD  CONSTRAINT [FK_Bookings_User] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO

ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_User]
GO

ALTER TABLE [dbo].[Feedbacks]  WITH CHECK ADD  CONSTRAINT [FK_Feedbacks_User] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO

ALTER TABLE [dbo].[Feedbacks] CHECK CONSTRAINT [FK_Feedbacks_User]
GO

ALTER TABLE [dbo].[Feedbacks]  WITH NOCHECK ADD  CONSTRAINT [FK_Feedbacks_Users] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO

ALTER TABLE [dbo].[Feedbacks] CHECK CONSTRAINT [FK_Feedbacks_Users]
GO

ALTER TABLE [dbo].[Floors]  WITH CHECK ADD  CONSTRAINT [FK_Floors_VehicleType] FOREIGN KEY([VehicleTypeID])
REFERENCES [dbo].[VehicleTypes] ([VehicleTypeID])
GO

ALTER TABLE [dbo].[Floors] CHECK CONSTRAINT [FK_Floors_VehicleType]
GO

ALTER TABLE [dbo].[IncidentReports]  WITH NOCHECK ADD  CONSTRAINT [FK_IncidentReports_Sessions] FOREIGN KEY([SessionID])
REFERENCES [dbo].[ParkingSessions] ([SessionID])
GO

ALTER TABLE [dbo].[IncidentReports] CHECK CONSTRAINT [FK_IncidentReports_Sessions]
GO

ALTER TABLE [dbo].[IncidentReports]  WITH NOCHECK ADD  CONSTRAINT [FK_IncidentReports_Slots] FOREIGN KEY([AssignedSlotID])
REFERENCES [dbo].[Slots] ([SlotID])
GO

ALTER TABLE [dbo].[IncidentReports] CHECK CONSTRAINT [FK_IncidentReports_Slots]
GO

ALTER TABLE [dbo].[IncidentReports]  WITH CHECK ADD  CONSTRAINT [FK_Incidents_Session] FOREIGN KEY([SessionID])
REFERENCES [dbo].[ParkingSessions] ([SessionID])
GO

ALTER TABLE [dbo].[IncidentReports] CHECK CONSTRAINT [FK_Incidents_Session]
GO

ALTER TABLE [dbo].[IncidentReports]  WITH CHECK ADD  CONSTRAINT [FK_Incidents_Slot] FOREIGN KEY([AssignedSlotID])
REFERENCES [dbo].[Slots] ([SlotID])
GO

ALTER TABLE [dbo].[IncidentReports] CHECK CONSTRAINT [FK_Incidents_Slot]
GO

ALTER TABLE [dbo].[ParkingSessions]  WITH CHECK ADD  CONSTRAINT [FK_Sessions_Booking] FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO

ALTER TABLE [dbo].[ParkingSessions] CHECK CONSTRAINT [FK_Sessions_Booking]
GO

ALTER TABLE [dbo].[ParkingSessions]  WITH CHECK ADD  CONSTRAINT [FK_Sessions_Slot] FOREIGN KEY([SlotID])
REFERENCES [dbo].[Slots] ([SlotID])
GO

ALTER TABLE [dbo].[ParkingSessions] CHECK CONSTRAINT [FK_Sessions_Slot]
GO

ALTER TABLE [dbo].[ParkingSessions]  WITH CHECK ADD  CONSTRAINT [FK_Sessions_User] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO

ALTER TABLE [dbo].[ParkingSessions] CHECK CONSTRAINT [FK_Sessions_User]
GO

ALTER TABLE [dbo].[ParkingSessions]  WITH CHECK ADD  CONSTRAINT [FK_Sessions_Vehicle] FOREIGN KEY([VehicleTypeID])
REFERENCES [dbo].[VehicleTypes] ([VehicleTypeID])
GO

ALTER TABLE [dbo].[ParkingSessions] CHECK CONSTRAINT [FK_Sessions_Vehicle]
GO

ALTER TABLE [dbo].[Payments]  WITH CHECK ADD  CONSTRAINT [FK_Payments_Booking] FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO

ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [FK_Payments_Booking]
GO

ALTER TABLE [dbo].[Payments]  WITH NOCHECK ADD  CONSTRAINT [FK_Payments_Bookings] FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO

ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [FK_Payments_Bookings]
GO

ALTER TABLE [dbo].[Payments]  WITH CHECK ADD  CONSTRAINT [FK_Payments_Session] FOREIGN KEY([SessionID])
REFERENCES [dbo].[ParkingSessions] ([SessionID])
GO

ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [FK_Payments_Session]
GO

ALTER TABLE [dbo].[Payments]  WITH NOCHECK ADD  CONSTRAINT [FK_Payments_Sessions] FOREIGN KEY([SessionID])
REFERENCES [dbo].[ParkingSessions] ([SessionID])
GO

ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [FK_Payments_Sessions]
GO

ALTER TABLE [dbo].[PricePolicies]  WITH CHECK ADD  CONSTRAINT [FK_PricePolicies_VehicleType] FOREIGN KEY([VehicleTypeID])
REFERENCES [dbo].[VehicleTypes] ([VehicleTypeID])
GO

ALTER TABLE [dbo].[PricePolicies] CHECK CONSTRAINT [FK_PricePolicies_VehicleType]
GO

ALTER TABLE [dbo].[PricePolicies]  WITH NOCHECK ADD  CONSTRAINT [FK_PricePolicies_VehicleTypes] FOREIGN KEY([VehicleTypeID])
REFERENCES [dbo].[VehicleTypes] ([VehicleTypeID])
GO

ALTER TABLE [dbo].[PricePolicies] CHECK CONSTRAINT [FK_PricePolicies_VehicleTypes]
GO

ALTER TABLE [dbo].[RolePermission]  WITH CHECK ADD  CONSTRAINT [FK_RP_Permission] FOREIGN KEY([PermissionID])
REFERENCES [dbo].[Permissions] ([PermissionID])
GO

ALTER TABLE [dbo].[RolePermission] CHECK CONSTRAINT [FK_RP_Permission]
GO

ALTER TABLE [dbo].[RolePermission]  WITH CHECK ADD  CONSTRAINT [FK_RP_Role] FOREIGN KEY([RoleID])
REFERENCES [dbo].[Roles] ([RoleID])
GO

ALTER TABLE [dbo].[RolePermission] CHECK CONSTRAINT [FK_RP_Role]
GO

ALTER TABLE [dbo].[Slots]  WITH CHECK ADD  CONSTRAINT [FK_Slots_Floor] FOREIGN KEY([FloorID])
REFERENCES [dbo].[Floors] ([FloorID])
GO

ALTER TABLE [dbo].[Slots] CHECK CONSTRAINT [FK_Slots_Floor]
GO

ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Role] FOREIGN KEY([RoleID])
REFERENCES [dbo].[Roles] ([RoleID])
GO

ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Role]
GO
