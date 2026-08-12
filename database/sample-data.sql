-- Optional sample/demo data for Parking Building Management System
-- Run after seed.sql when demo data is needed.
USE [system_database]
GO

-- Bookings

SET IDENTITY_INSERT [dbo].[Bookings] ON
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (1, 4, NULL, NULL, NULL, N'30H-55555', 8, CAST(N'2026-05-24T14:00:00.000' AS DateTime), CAST(N'2026-05-24T18:00:00.000' AS DateTime), N'Expired')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (2, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 6, CAST(N'2026-07-18T16:30:00.000' AS DateTime), CAST(N'2026-07-18T17:00:00.000' AS DateTime), N'Cancelled')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (3, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 1, CAST(N'2026-07-18T16:30:00.000' AS DateTime), CAST(N'2026-07-18T17:00:00.000' AS DateTime), N'Cancelled')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (4, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 1, CAST(N'2026-07-18T16:32:00.000' AS DateTime), CAST(N'2026-07-18T17:02:00.000' AS DateTime), N'Expired')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (5, NULL, N'guest-1784765799113-7rikbfv0', N'Thinh', N'0123456789', N'72H-11111', 1, CAST(N'2026-07-23T07:25:33.077' AS DateTime), CAST(N'2026-07-23T07:55:33.077' AS DateTime), N'CheckedIn')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (6, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72A-11111', 4, CAST(N'2026-07-30T21:39:14.513' AS DateTime), CAST(N'2026-07-30T22:09:14.513' AS DateTime), N'CheckedIn')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (7, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 1, CAST(N'2026-07-30T21:52:05.933' AS DateTime), CAST(N'2026-07-30T22:22:05.933' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (8, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 1, CAST(N'2026-07-30T21:56:28.323' AS DateTime), CAST(N'2026-07-30T22:26:28.323' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (9, 5, NULL, NULL, NULL, N'N', 1, CAST(N'2026-07-31T15:07:13.237' AS DateTime), CAST(N'2026-07-31T15:37:13.237' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (10, 5, NULL, NULL, NULL, N'N', 1, CAST(N'2026-07-31T15:07:59.230' AS DateTime), CAST(N'2026-07-31T15:37:59.230' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (11, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'M', 6, CAST(N'2026-07-31T15:17:45.103' AS DateTime), CAST(N'2026-07-31T15:47:45.103' AS DateTime), N'Cancelled')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (12, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'U', 6, CAST(N'2026-07-31T15:18:32.510' AS DateTime), CAST(N'2026-07-31T15:48:32.510' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (13, 11, NULL, NULL, NULL, N'72H-12345', 7, CAST(N'2026-07-31T16:18:19.837' AS DateTime), CAST(N'2026-07-31T16:48:19.837' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (14, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 8, CAST(N'2026-08-01T22:25:30.647' AS DateTime), CAST(N'2026-08-01T22:55:00.000' AS DateTime), N'PendingPayment')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (15, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 6, CAST(N'2026-08-02T16:35:09.000' AS DateTime), CAST(N'2026-08-02T17:00:00.000' AS DateTime), N'PendingPayment')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (16, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-12345', 6, CAST(N'2026-08-02T16:36:56.570' AS DateTime), CAST(N'2026-08-02T20:00:00.000' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (17, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 6, CAST(N'2026-08-04T15:03:12.137' AS DateTime), CAST(N'2026-08-04T18:32:00.000' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (18, 15, NULL, NULL, NULL, N'CODTEST-XM-BOOK', 21, CAST(N'2026-08-05T12:30:56.950' AS DateTime), CAST(N'2026-08-05T14:30:56.950' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (19, 15, NULL, NULL, NULL, N'CODTEST-XM-PRICE', 22, CAST(N'2026-08-05T01:00:00.000' AS DateTime), CAST(N'2026-08-05T05:00:00.000' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (20, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 1, CAST(N'2026-08-05T14:32:00.000' AS DateTime), CAST(N'2026-08-05T18:32:00.000' AS DateTime), N'Completed')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (21, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-12345', 6, CAST(N'2026-08-05T16:51:00.000' AS DateTime), CAST(N'2026-08-05T17:29:00.000' AS DateTime), N'Cancelled')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (22, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-12345', 2, CAST(N'2026-08-05T17:38:00.000' AS DateTime), CAST(N'2026-08-05T22:36:00.000' AS DateTime), N'Expired')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (23, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-12345', 6, CAST(N'2026-08-08T09:59:00.000' AS DateTime), CAST(N'2026-08-08T15:59:00.000' AS DateTime), N'PendingPayment')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (24, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-11111', 1, CAST(N'2026-08-08T09:59:00.000' AS DateTime), CAST(N'2026-08-08T15:59:00.000' AS DateTime), N'CheckedIn')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (25, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'72H-99999', 6, CAST(N'2026-08-08T10:03:00.000' AS DateTime), CAST(N'2026-08-08T15:03:00.000' AS DateTime), N'CheckedIn')
GO

INSERT [dbo].[Bookings] ([BookingID], [UserID], [GuestToken], [GuestName], [GuestPhone], [LicensePlate], [SlotID], [StartTime], [EndTime], [Status]) VALUES (26, NULL, N'guest-1782462670632-fwaid5ja', N'Thinh', N'0326133968', N'005H', 7, CAST(N'2026-08-08T10:10:00.000' AS DateTime), CAST(N'2026-08-08T14:10:00.000' AS DateTime), N'CheckedIn')
GO

SET IDENTITY_INSERT [dbo].[Bookings] OFF
GO

-- ParkingSessions

SET IDENTITY_INSERT [dbo].[ParkingSessions] ON
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (1, 1, 1, NULL, NULL, NULL, N'18B1-99988', N'CARD_9999_XM', CAST(N'2026-05-24T08:00:00.000' AS DateTime), CAST(N'2026-05-24T11:30:00.000' AS DateTime), NULL, NULL, N'Completed', NULL, N'OPENED')
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (2, 2, 1, NULL, NULL, NULL, N'29A-12345', N'CARD_0011_XM', CAST(N'2026-05-24T16:15:00.000' AS DateTime), CAST(N'2026-07-30T16:49:53.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (3, 8, 2, NULL, NULL, NULL, N'30E-99999', N'CARD_0022_OT', CAST(N'2026-05-24T13:00:00.000' AS DateTime), CAST(N'2026-08-02T16:18:30.000' AS DateTime), NULL, NULL, N'Completed', N'LOST_TICKET', NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (4, 8, 1, NULL, NULL, NULL, N'72H-11111', N'CARD-355797', CAST(N'2026-07-18T16:02:35.000' AS DateTime), CAST(N'2026-07-18T16:14:25.507' AS DateTime), N'https://storage.parking.com/images/in/captured-plate.jpg', NULL, N'Completed', NULL, N'READY_TO_OPEN')
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (5, 1, 2, NULL, NULL, NULL, N'72H-11111', N'CARD-091251', CAST(N'2026-07-18T16:14:51.000' AS DateTime), CAST(N'2026-07-18T16:15:30.990' AS DateTime), N'https://storage.parking.com/images/in/captured-plate.jpg', NULL, N'Completed', NULL, N'READY_TO_OPEN')
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (6, 3, 2, NULL, NULL, NULL, N'72H-11111', N'CARD-224970', CAST(N'2026-07-18T16:17:04.000' AS DateTime), CAST(N'2026-07-18T16:17:58.000' AS DateTime), N'https://storage.parking.com/images/in/captured-plate.jpg', N'https://storage.parking.com/images/out/captured-exit.jpg', N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (7, 3, 2, NULL, NULL, NULL, N'72H-11111', N'CARD-001606', CAST(N'2026-07-18T16:30:01.000' AS DateTime), CAST(N'2026-07-18T16:30:39.453' AS DateTime), N'https://storage.parking.com/images/in/captured-plate.jpg', NULL, N'Completed', NULL, N'READY_TO_OPEN')
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (8, 6, 1, NULL, NULL, NULL, N'72H-11111', N'CARD-357089', CAST(N'2026-07-23T07:25:57.000' AS DateTime), CAST(N'2026-07-23T07:30:04.080' AS DateTime), NULL, NULL, N'Completed', NULL, N'READY_TO_OPEN')
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (9, 2, 2, NULL, NULL, NULL, N'72E-12345', N'CARD-229217', CAST(N'2026-07-30T21:03:49.000' AS DateTime), CAST(N'2026-07-30T22:45:47.000' AS DateTime), NULL, NULL, N'Completed', N'LOST_TICKET', NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (10, 5, 2, NULL, NULL, NULL, N'72A-11111', N'CARD-383907', CAST(N'2026-07-30T21:39:43.000' AS DateTime), CAST(N'2026-07-30T21:51:24.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (11, 1, 2, NULL, NULL, NULL, N'72H-11111', N'CARD-267200', CAST(N'2026-07-30T21:54:27.000' AS DateTime), CAST(N'2026-07-30T21:56:05.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (12, 1, 2, NULL, NULL, NULL, N'72H-11111', N'CARD-432824', CAST(N'2026-07-30T21:57:12.000' AS DateTime), CAST(N'2026-07-30T21:57:25.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (13, 1, 1, NULL, NULL, NULL, N'72H-11111', N'CARD-089242', CAST(N'2026-07-30T22:08:09.000' AS DateTime), CAST(N'2026-07-30T22:09:23.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (14, 2, 1, NULL, NULL, NULL, N'72H-12345', N'CARD-443756', CAST(N'2026-07-31T09:54:03.000' AS DateTime), CAST(N'2026-07-31T09:54:51.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (15, 1, 1, NULL, NULL, NULL, N'72H-12345', N'CARD-539814', CAST(N'2026-07-31T09:55:39.000' AS DateTime), CAST(N'2026-07-31T09:56:00.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (16, 6, 2, NULL, NULL, NULL, N'72H-12345', N'CARD-760256', CAST(N'2026-07-31T09:59:20.000' AS DateTime), CAST(N'2026-07-31T10:15:18.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (17, 1, 1, NULL, NULL, NULL, N'72H-11111', N'CARD-259632', CAST(N'2026-07-31T10:24:19.000' AS DateTime), CAST(N'2026-08-02T16:17:42.000' AS DateTime), NULL, NULL, N'Completed', N'LOST_TICKET', NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (18, 1, 1, NULL, NULL, NULL, N'N', N'CARD-249236', CAST(N'2026-07-31T15:07:29.000' AS DateTime), CAST(N'2026-07-31T15:07:48.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (19, 6, 2, NULL, NULL, NULL, N'U', N'CARD-095763', CAST(N'2026-07-31T15:21:35.000' AS DateTime), CAST(N'2026-08-02T16:17:53.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (20, 1, 1, NULL, NULL, NULL, N'N', N'CARD-207316', CAST(N'2026-07-31T15:23:27.000' AS DateTime), CAST(N'2026-08-02T16:18:03.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (21, 2, 2, NULL, NULL, NULL, N'51-T32000', N'CARD-053925', CAST(N'2026-07-31T16:10:53.000' AS DateTime), CAST(N'2026-08-02T16:18:18.000' AS DateTime), N'https://res.cloudinary.com/nkzvyvva/image/upload/v1785489055/parking_photos/y46gyo0z6hvyoqd5arkv.jpg', NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (22, 16, 2, NULL, NULL, NULL, N'99-H7060', N'CARD-132168', CAST(N'2026-07-31T16:12:12.000' AS DateTime), CAST(N'2026-07-31T16:15:14.000' AS DateTime), N'https://res.cloudinary.com/nkzvyvva/image/upload/v1785489134/parking_photos/abvpbqpr66ndfrxykomk.jpg', N'https://res.cloudinary.com/nkzvyvva/image/upload/v1785489317/parking_photos/idjr66lnw5fi7ncwghgi.jpg', N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (23, 7, 2, NULL, NULL, NULL, N'72H-12345', N'CARD-688449', CAST(N'2026-07-31T16:21:28.000' AS DateTime), CAST(N'2026-08-02T16:17:48.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (24, 1, 2, NULL, NULL, NULL, N'72H-11111', N'CARD-445950', CAST(N'2026-08-02T16:20:45.000' AS DateTime), CAST(N'2026-08-02T16:21:50.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (25, 6, 2, 16, NULL, N'guest-1782462670632-fwaid5ja', N'72H-12345', N'CARD-476059', CAST(N'2026-08-02T16:37:56.000' AS DateTime), CAST(N'2026-08-02T16:39:25.113' AS DateTime), NULL, NULL, N'Completed', NULL, N'READY_TO_OPEN')
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (26, 6, 1, NULL, NULL, NULL, N'72H-11111', N'CARD-705479', CAST(N'2026-08-04T15:05:05.000' AS DateTime), CAST(N'2026-08-04T15:05:52.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (27, 19, 2, NULL, NULL, NULL, N'CODTEST-OT-ACTIVE', N'CODTEST-CARD-01', CAST(N'2026-08-05T09:00:56.000' AS DateTime), CAST(N'2026-08-05T13:58:12.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (28, 22, 1, 19, NULL, NULL, N'CODTEST-XM-PRICE', N'CODTEST-PRICE-CARD', CAST(N'2026-08-05T10:38:05.000' AS DateTime), CAST(N'2026-08-05T13:58:02.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (29, 6, 1, 18, NULL, NULL, N'CODTEST-XM-BOOK', N'CARD-017419', CAST(N'2026-08-05T13:56:57.000' AS DateTime), CAST(N'2026-08-05T13:57:45.000' AS DateTime), NULL, NULL, N'Completed', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (30, 1, 2, 20, NULL, N'guest-1782462670632-fwaid5ja', N'72H-11111', N'CARD-481310', CAST(N'2026-08-05T14:32:00.000' AS DateTime), CAST(N'2026-08-05T18:32:00.000' AS DateTime), NULL, NULL, N'Completed', N'LOST_TICKET', NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (31, 1, 2, 24, NULL, N'guest-1782462670632-fwaid5ja', N'72H-11111', N'CARD-394855', CAST(N'2026-08-08T09:59:00.000' AS DateTime), NULL, NULL, NULL, N'Active', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (32, 6, 1, 25, NULL, N'guest-1782462670632-fwaid5ja', N'72H-99999', N'CARD-562236', CAST(N'2026-08-08T10:03:00.000' AS DateTime), NULL, NULL, NULL, N'Active', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (33, 2, 2, NULL, NULL, NULL, N'72H12345', N'CARD-635173', CAST(N'2026-08-08T09:37:15.000' AS DateTime), NULL, NULL, NULL, N'Active', N'LOST_TICKET', NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (34, 3, 2, NULL, NULL, NULL, N'001H', N'CARD-808544', CAST(N'2026-08-08T09:40:08.000' AS DateTime), NULL, NULL, NULL, N'Active', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (35, 4, 2, NULL, NULL, NULL, N'002H', N'CARD-813367', CAST(N'2026-08-08T09:40:13.000' AS DateTime), NULL, NULL, NULL, N'Active', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (36, 5, 2, NULL, NULL, NULL, N'003H', N'CARD-817149', CAST(N'2026-08-08T09:40:17.000' AS DateTime), NULL, NULL, NULL, N'Active', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (37, 16, 2, NULL, NULL, NULL, N'004H', N'CARD-821660', CAST(N'2026-08-08T09:40:21.000' AS DateTime), NULL, NULL, NULL, N'Active', NULL, NULL)
GO

INSERT [dbo].[ParkingSessions] ([SessionID], [SlotID], [VehicleTypeID], [BookingID], [UserID], [GuestToken], [LicensePlate], [CardNumber], [CheckInTime], [CheckOutTime], [ImageInUrl], [ImageOutUrl], [SessionStatus], [ExceptionType], [BarrierStatus]) VALUES (38, 7, 1, 26, NULL, N'guest-1782462670632-fwaid5ja', N'005H', N'CARD-493009', CAST(N'2026-08-08T10:10:00.000' AS DateTime), NULL, NULL, NULL, N'Active', NULL, NULL)
GO

SET IDENTITY_INSERT [dbo].[ParkingSessions] OFF
GO

-- Payments

SET IDENTITY_INSERT [dbo].[Payments] ON
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4281000, NULL, 1, 2, CAST(N'2026-07-22T22:35:53.8344181' AS DateTime2), NULL, N'1784734552', N'1adbe98875924ba895ce5d6f313f157b', N'00020101021238570010A000000727012700069704220113VQRQAKQRB24100208QRIBFTTA5303704540742810005802VN62180814BaiXe 29A1234563045A23', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4281000, NULL, 2, 2, CAST(N'2026-07-22T22:35:54.0474917' AS DateTime2), NULL, N'1784734553', N'4e37f600b1634e1c8cd5a7e1d1b0b817', N'00020101021238570010A000000727012700069704220113VQRQAKQRB24160208QRIBFTTA5303704540742810005802VN62180814BaiXe 29A123456304322B', N'QR_PAYOS', N'EXPIRED')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4281000, NULL, 3, 2, CAST(N'2026-07-22T22:35:53.8216544' AS DateTime2), NULL, N'1784734550', N'9470e8c86b4b47cdbb60df9939277ba6', N'00020101021238570010A000000727012700069704220113VQRQAKQRB24050208QRIBFTTA5303704540742810005802VN62180814BaiXe 29A123456304D87D', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (5000, NULL, 4, 8, CAST(N'2026-07-23T07:30:04.0744625' AS DateTime2), NULL, N'1784766569', N'd3707642e4204ebd9c6178316b89107b', N'00020101021238570010A000000727012700069704220113VQRQAKQSG25640208QRIBFTTA5303704540450005802VN62180814BaiXe 72H1111163047E47', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4620000, NULL, 5, 2, CAST(N'2026-07-27T16:14:00.7106976' AS DateTime2), NULL, N'1785143639', N'd79af0f832e8486eac537cf93977b369', N'00020101021238570010A000000727012700069704220113VQRQAKTNA83800208QRIBFTTA5303704540746200005802VN62180814BaiXe 29A123456304680F', N'QR_PAYOS', N'EXPIRED')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (7865000, NULL, 6, 3, CAST(N'2026-07-28T20:43:19.4418063' AS DateTime2), NULL, N'1785246197', N'919b550a75614dd3af1916be72502070', N'00020101021238570010A000000727012700069704220113VQRQAKUII26400208QRIBFTTA5303704540778650005802VN62180814BaiXe 30E999996304A616', N'QR_PAYOS', N'EXPIRED')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4707000, NULL, 7, 2, CAST(N'2026-07-28T20:44:24.3569111' AS DateTime2), NULL, N'1785246263', N'824a50bc259049f4ae201813ecf7b8fd', N'00020101021238570010A000000727012700069704220113VQRQAKUII53380208QRIBFTTA5303704540747070005802VN62180814BaiXe 29A1234563048961', N'QR_PAYOS', N'EXPIRED')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4758000, NULL, 8, 2, CAST(N'2026-07-29T13:58:21.2621606' AS DateTime2), NULL, N'1785308299', N'513473f882724d99801bcda8bcaabaea', N'00020101021238570010A000000727012700069704220113VQRQAKUQC75540208QRIBFTTA5303704540747580005802VN62180814BaiXe 29A12345630471DA', N'QR_PAYOS', N'EXPIRED')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4767000, NULL, 9, 2, CAST(N'2026-07-29T16:44:13.2491465' AS DateTime2), NULL, N'1785318250', N'1683f7f94e924a7c822187b147f47b94', N'00020101021238570010A000000727012700069704220113VQRQAKUSL76560208QRIBFTTA5303704540747670005802VN62180814BaiXe 29A123456304F3B3', N'QR_PAYOS', N'EXPIRED')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4839000, NULL, 10, 2, CAST(N'2026-07-30T16:37:53.3184600' AS DateTime2), NULL, N'1785404272', N'6f2bc8d075b5471e8471fc0f58e27214', N'00020101021238570010A000000727012700069704220113VQRQAKVHN79780208QRIBFTTA5303704540748390005802VN62180814BaiXe 29A123456304CE22', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (8085000, NULL, 11, 3, CAST(N'2026-07-30T16:38:35.9704266' AS DateTime2), NULL, N'1785404315', N'60bd530d89ae45a8b3f6386fa6350a84', N'00020101021238570010A000000727012700069704220113VQRQAKVHO01940208QRIBFTTA5303704540780850005802VN62180814BaiXe 30E999996304AAFC', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4839000, NULL, 12, 2, CAST(N'2026-07-30T16:49:54.1055454' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (10000, NULL, 13, 10, CAST(N'2026-07-30T21:51:26.1824100' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (10000, NULL, 14, 11, CAST(N'2026-07-30T21:56:05.8712600' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (10000, NULL, 15, 12, CAST(N'2026-07-30T21:57:26.0595524' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (5000, NULL, 16, 13, NULL, NULL, N'1785424117', N'd911865cfc9d46d082a165da953ab410', N'00020101021238570010A000000727012700069704220113VQRQAKVOI95720208QRIBFTTA5303704540450005802VN62180814BaiXe 72H1111163045B17', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (5000, NULL, 17, 13, NULL, NULL, N'1785424119', N'ce858ed788af43b29c0e634174fb037f', N'00020101021238570010A000000727012700069704220113VQRQAKVOK45380208QRIBFTTA5303704540450005802VN62180814BaiXe 72H111116304AEFD', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (5000, NULL, 18, 13, CAST(N'2026-07-30T22:09:23.7127370' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (115000, NULL, 19, 9, CAST(N'2026-07-30T22:45:47.6796772' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (55000, NULL, 20, 14, CAST(N'2026-07-31T09:54:51.4640445' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (55000, NULL, 21, 15, CAST(N'2026-07-31T09:56:00.3982913' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (0, NULL, 22, 16, CAST(N'2026-07-31T10:00:07.5964560' AS DateTime2), NULL, NULL, NULL, NULL, N'Cash', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (5000, NULL, 23, 18, CAST(N'2026-07-31T15:07:48.8428652' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (10000, NULL, 24, 22, CAST(N'2026-07-31T16:15:17.0225556' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (165000, 12, 25, 19, NULL, N'guest-1782462670632-fwaid5ja', N'1785585879', N'df0d1910835a4d8da6ab821626cdcc2b', N'00020101021238570010A000000727012700069704220113VQRQAKWRR38240208QRIBFTTA530370454061650005802VN62110807BaiXe U6304EEF4', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (1250, 14, 26, NULL, NULL, N'guest-1782462670632-fwaid5ja', N'1785597930', N'31850992fdc64c6dbb7eaf512b751837', N'00020101021238570010A000000727012700069704220113VQRQAKWVX82600208QRIBFTTA5303704540412505802VN62220818CocDatCho 72H1111163046882', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (224000, NULL, 27, 17, CAST(N'2026-08-02T16:17:42.8922821' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (265000, NULL, 28, 23, CAST(N'2026-08-02T16:17:48.7853295' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (270000, NULL, 29, 19, CAST(N'2026-08-02T16:17:53.1790698' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (159000, NULL, 30, 20, CAST(N'2026-08-02T16:18:03.7506155' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (270000, NULL, 31, 21, CAST(N'2026-08-02T16:18:18.5173834' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (8545000, NULL, 32, 3, CAST(N'2026-08-02T16:18:30.5619479' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (10000, NULL, 33, 24, CAST(N'2026-08-02T16:21:50.9478520' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (1250, 15, 34, NULL, NULL, N'guest-1782462670632-fwaid5ja', N'1785663309', N'92784400e7a14c06b94131ffe24bf9fa', N'00020101021238570010A000000727012700069704220113VQRQAKXGI56080208QRIBFTTA5303704540412505802VN62220818CocDatCho 72H1111163044781', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (3500, 16, 35, NULL, CAST(N'2026-08-02T16:36:56.5645914' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1785663333', N'6886a4a198674295948506960b217db6', N'00020101021238570010A000000727012700069704220113VQRQAKXGI65080208QRIBFTTA5303704540435005802VN62220818CocDatCho 72H123456304B0C2', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (10000, 16, 36, 25, CAST(N'2026-08-02T16:39:25.1086636' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1785663543', N'ae0bf5d4586f4f109a48091c28f188c1', N'00020101021238570010A000000727012700069704220113VQRQAKXGK83660208QRIBFTTA53037045405100005802VN62180814BaiXe 72H123456304BA1D', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (3500, 17, 37, NULL, CAST(N'2026-08-04T15:03:12.1199160' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1785830562', N'3d16aaba896a4b3083c3ac8986c3a703', N'00020101021238570010A000000727012700069704220113VQRQAKYMB57240208QRIBFTTA5303704540435005802VN62220818CocDatCho 72H1111163045611', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (5000, NULL, 38, 26, CAST(N'2026-08-04T15:05:52.0905403' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (30000, NULL, 39, 27, CAST(N'2026-08-05T10:30:56.9566667' AS DateTime2), NULL, N'CODTEST-PAID-001', N'CODTEST-LINK-001', N'CODTEST-QR', N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (2750, 19, 40, NULL, CAST(N'2026-08-05T10:48:05.7400000' AS DateTime2), NULL, N'CODTEST-PRICE-DEPOSIT', N'CODTEST-PRICE-LINK', N'CODTEST-PRICE-QR', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (5000, 18, 41, 29, NULL, NULL, N'1785913055', N'a122e8058ef043d585f4b851746bb93d', N'00020101021238570010A000000727012700069704220113VQRQAKZDS79000208QRIBFTTA5303704540450005802VN62230819BaiXe CODTESTXMBOOK6304DB3D', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (5000, 18, 42, 29, CAST(N'2026-08-05T13:57:45.4541968' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (10500, 19, 43, 28, NULL, NULL, N'1785913079', N'843c98c0850c47079a3029b715f10a76', N'00020101021238570010A000000727012700069704220113VQRQAKZDS83520208QRIBFTTA53037045405105005802VN62240820BaiXe CODTESTXMPRICE6304CBB8', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (10500, 19, 44, 28, CAST(N'2026-08-05T13:58:02.1663868' AS DateTime2), NULL, NULL, NULL, NULL, N'CASH', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (6250, 20, 45, NULL, CAST(N'2026-08-05T14:03:52.9647525' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1785913386', N'be55bef9a2664241a66c6dfc0a49d21f', N'00020101021238570010A000000727012700069704220113VQRQAKZDU76660208QRIBFTTA5303704540462505802VN62220818CocDatCho 72H1111163044E6D', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (18750, 20, 46, 30, CAST(N'2026-08-05T14:05:46.5491034' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1785913510', N'5db3aea110314273894c305f889bd478', N'00020101021238570010A000000727012700069704220113VQRQAKZDV22320208QRIBFTTA53037045405187505802VN62180814BaiXe 72H111116304C9FC', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (118750, 20, 47, 30, NULL, N'guest-1782462670632-fwaid5ja', N'1785913868', N'b05e9585e41145ddac8d6e26c089ee33', N'00020101021238570010A000000727012700069704220113VQRQAKZDY49200208QRIBFTTA530370454061187505802VN62180814BaiXe 72H111116304239D', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (118750, 20, 48, 30, NULL, N'guest-1782462670632-fwaid5ja', N'1785919835', N'095f70cc352a43d89c929691ec7d4167', N'00020101021238570010A000000727012700069704220113VQRQAKZFG21580208QRIBFTTA530370454061187505802VN62180814BaiXe 72H1111163047D0A', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (118750, 20, 49, 30, NULL, N'guest-1782462670632-fwaid5ja', N'1785920071', N'1aa5cd66206944059f0c84ecd801221c', N'00020101021238570010A000000727012700069704220113VQRQAKZFF44580208QRIBFTTA530370454061187505802VN62180814BaiXe 72H111116304A567', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (118750, 20, 50, 30, NULL, N'guest-1782462670632-fwaid5ja', N'1785920612', N'73b5ff44a4434bc39a605ed48c5c980d', N'00020101021238570010A000000727012700069704220113VQRQAKZFK79360208QRIBFTTA530370454061187505802VN62180814BaiXe 72H1111163048D87', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (118750, 20, 51, 30, NULL, N'guest-1782462670632-fwaid5ja', N'1785920613', N'11059f1a5f2e40fca87c8b15198ad7cf', N'00020101021238570010A000000727012700069704220113VQRQAKZFJ37980208QRIBFTTA530370454061187505802VN62180814BaiXe 72H1111163041A7F', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (1250, 21, 52, NULL, NULL, N'guest-1782462670632-fwaid5ja', N'1785921702', N'88d0d71d10f0430587ddbf6b2e187380', N'00020101021238570010A000000727012700069704220113VQRQAKZFS80680208QRIBFTTA5303704540412505802VN62220818CocDatCho 72H123456304C6E1', N'QR_PAYOS', N'EXPIRED')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (2000, 21, 53, NULL, CAST(N'2026-08-05T16:29:50.9920980' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1785922141', N'0c6b0c64c24f496e82a67478a7d682a9', N'00020101021238570010A000000727012700069704220113VQRQAKZFW44240208QRIBFTTA5303704540420005802VN62220818CocDatCho 72H123456304E59D', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (7500, 22, 54, NULL, CAST(N'2026-08-05T17:07:17.4701438' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1785924402', N'd6ffc82c6f5047538a0f898ba1b481f9', N'00020101021238570010A000000727012700069704220113VQRQAKZGO28060208QRIBFTTA5303704540475005802VN62220818CocDatCho 72H1234563044BEF', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (118750, 20, 55, 30, NULL, N'guest-1782462670632-fwaid5ja', N'1786156151', N'8651df3ad9914a43b16561fe876b9088', N'00020101021238570010A000000727012700069704220113VQRQALAWZ68360208QRIBFTTA530370454061187505802VN62180814BaiXe 72H111116304AB99', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (5000, 23, 56, NULL, NULL, N'guest-1782462670632-fwaid5ja', N'1786156191', N'733c41ec14ec44be8ce21e84d4063157', N'00020101021238570010A000000727012700069704220113VQRQALAXB51990208QRIBFTTA5303704540450005802VN62220818CocDatCho 72H123456304A359', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (8750, 24, 57, NULL, CAST(N'2026-08-08T09:31:44.7124599' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1786156235', N'aa309146da2949ddbabb61c698dd2de6', N'00020101021238570010A000000727012700069704220113VQRQALAXB99680208QRIBFTTA5303704540487505802VN62220818CocDatCho 72H111116304E8D1', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (26250, 24, 58, 31, NULL, N'guest-1782462670632-fwaid5ja', N'1786156431', N'2d570ca668b44e0db4bb0d4ae40ee606', N'00020101021238570010A000000727012700069704220113VQRQALAXE65800208QRIBFTTA53037045405262505802VN62180814BaiXe 72H111116304A55A', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (4250, 25, 59, NULL, CAST(N'2026-08-08T09:34:55.5133658' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1786156467', N'1bf337b0c5424fce85c5ae561accd89f', N'00020101021238570010A000000727012700069704220113VQRQALAXC87780208QRIBFTTA5303704540442505802VN62220818CocDatCho 72H999996304DBD5', N'QR_PAYOS', N'SUCCESS')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (110000, NULL, 60, 33, NULL, NULL, N'1786156687', N'4350dea4f4bc4848b857dc6c1ecdf6af', N'00020101021238570010A000000727012700069704220113VQRQALAXF98280208QRIBFTTA530370454061100005802VN62180814BaiXe 72H1234563043F06', N'QR_PAYOS', N'PENDING')
GO

INSERT [dbo].[Payments] ([Amount], [BookingID], [PaymentID], [SessionID], [PaymentTime], [GuestToken], [OrderId], [PaymentLinkId], [QrCode], [PaymentMethod], [Status]) VALUES (3500, 26, 61, NULL, CAST(N'2026-08-08T09:41:15.9341377' AS DateTime2), N'guest-1782462670632-fwaid5ja', N'1786156848', N'0b9f010f5e364a78afbee2a6a2587042', N'00020101021238570010A000000727012700069704220113VQRQALAXG55860208QRIBFTTA5303704540435005802VN62180814CocDatCho 005H63048849', N'QR_PAYOS', N'SUCCESS')
GO

SET IDENTITY_INSERT [dbo].[Payments] OFF
GO

-- Feedbacks

SET IDENTITY_INSERT [dbo].[Feedbacks] ON
GO

INSERT [dbo].[Feedbacks] ([FeedbackID], [UserID], [CreatedAt], [AssignedTo], [GuestPhone], [LicensePlate], [Status], [Category], [GuestToken], [GuestName], [Description]) VALUES (1, NULL, CAST(N'2026-07-23T07:33:37.4423743' AS DateTime2), N'STAFF', N'0123456789', N'29A-12345', N'Processing', N'OccupiedSlot', N'guest-1784765799113-7rikbfv0', N'Thinh', N'12adasdasda')
GO

INSERT [dbo].[Feedbacks] ([FeedbackID], [UserID], [CreatedAt], [AssignedTo], [GuestPhone], [LicensePlate], [Status], [Category], [GuestToken], [GuestName], [Description]) VALUES (2, NULL, CAST(N'2026-07-30T22:44:48.3351687' AS DateTime2), N'STAFF', N'0326133968', N'72E-12345', N'Processing', N'LostCard', N'guest-1782462670632-fwaid5ja', N'Thinh', N'idkdadwuidk')
GO

INSERT [dbo].[Feedbacks] ([FeedbackID], [UserID], [CreatedAt], [AssignedTo], [GuestPhone], [LicensePlate], [Status], [Category], [GuestToken], [GuestName], [Description]) VALUES (3, NULL, CAST(N'2026-07-31T10:24:48.6956279' AS DateTime2), N'STAFF', N'0326133968', N'72H-11111', N'Processing', N'LostCard', N'guest-1782462670632-fwaid5ja', N'Thinh', N'123aqwsedawd')
GO

SET IDENTITY_INSERT [dbo].[Feedbacks] OFF
GO

-- IncidentReports

SET IDENTITY_INSERT [dbo].[IncidentReports] ON
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (NULL, 1, NULL, NULL, CAST(N'2026-07-23T07:33:37.4763952' AS DateTime2), CAST(N'2026-07-23T07:35:15.1722655' AS DateTime2), NULL, N'29A-12345', N'RESOLVED', N'OCCUPIED_SLOT', N'GUEST', N'Nguon feedback #1 | Bien so: 29A-12345 | Guest: Thinh - 0123456789 | Noi dung: 12adasdasda', N'Staff dã hoàn t?t x? lý t?i qu?y và dóng biên b?n.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (2, 2, NULL, 2, CAST(N'2026-07-23T07:35:08.2761130' AS DateTime2), CAST(N'2026-07-23T07:35:13.2211911' AS DateTime2), N'XM-G03', N'29A-12345', N'RESOLVED', N'WRONG_PARKING_POSITION', N'STAFF', N'thay', N'Staff dã hoàn t?t x? lý t?i qu?y và dóng biên b?n.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (2, 3, NULL, 9, CAST(N'2026-07-30T22:15:40.0862593' AS DateTime2), CAST(N'2026-07-30T22:31:46.9279724' AS DateTime2), N'XM-G01', N'72E-12345', N'RESOLVED', N'WRONG_PARKING_POSITION', N'STAFF', N'Staff ghi nh?n xe dang d? sai v? trí trên so d? giám sát.', N'Staff dã hoàn t?t x? lý t?i qu?y và dóng biên b?n.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (NULL, 4, NULL, NULL, CAST(N'2026-07-30T22:44:48.4169589' AS DateTime2), NULL, NULL, N'72E-12345', N'OPEN', N'LOST_TICKET', N'GUEST', N'Nguon feedback #2 | Bien so: 72E-12345 | Guest: Thinh - 0326133968 | Noi dung: idkdadwuidk', N'Phan anh tu user/guest can Staff xac minh tai quay.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (2, 5, 100000, 9, CAST(N'2026-07-30T22:45:28.8213773' AS DateTime2), NULL, NULL, N'72E-12345', N'IN_REVIEW', N'LOST_TICKET', N'STAFF', N'Staff dã d?i chi?u gi?y t? xe và thông tin khách hàng.', N'Da xac minh giay to, cho thanh toan phi gui xe va phi mat ve.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (2, 6, 100000, 14, CAST(N'2026-07-31T09:54:18.3120021' AS DateTime2), CAST(N'2026-07-31T10:08:57.7670351' AS DateTime2), NULL, N'72H-12345', N'RESOLVED', N'LOST_TICKET', N'STAFF', N'Staff dã d?i chi?u gi?y t? xe và thông tin khách hàng.', N'Staff dã x? lý t?i qu?y.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (1, 7, 100000, 15, CAST(N'2026-07-31T09:55:53.2490290' AS DateTime2), CAST(N'2026-07-31T10:08:57.7382355' AS DateTime2), NULL, N'72H-12345', N'RESOLVED', N'LOST_TICKET', N'STAFF', N'Staff dã d?i chi?u gi?y t? xe và thông tin khách hàng.', N'Staff dã x? lý t?i qu?y.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (6, 8, NULL, 16, CAST(N'2026-07-31T09:59:35.9044801' AS DateTime2), CAST(N'2026-07-31T10:08:57.6735564' AS DateTime2), N'OT-105', N'72H-12345', N'RESOLVED', N'WRONG_PARKING_POSITION', N'STAFF', N'Staff ghi nh?n xe dang d? sai v? trí trên so d? giám sát.', N'Staff dã x? lý t?i qu?y.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (6, 9, NULL, 16, CAST(N'2026-07-31T10:00:05.7272760' AS DateTime2), CAST(N'2026-07-31T10:00:07.6081923' AS DateTime2), NULL, N'72H-12345', N'RESOLVED', N'PAYMENT_ERROR', N'STAFF', N'Staff ghi nh?n l?i thanh toán t?i qu?y.', N'Staff dã xác nh?n thanh toán thành công t?i qu?y.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (6, 10, NULL, 16, CAST(N'2026-07-31T10:08:57.5971215' AS DateTime2), CAST(N'2026-07-31T10:08:57.6369447' AS DateTime2), N'OT-101', N'72H-12345', N'RESOLVED', N'WRONG_PARKING_POSITION', N'STAFF', N'Staff ghi nh?n xe dang d? sai v? trí trên so d? giám sát.', N'Staff dã x? lý t?i qu?y.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (8, 11, NULL, 3, CAST(N'2026-07-31T10:16:27.0799055' AS DateTime2), CAST(N'2026-07-31T10:16:27.1261132' AS DateTime2), N'OT-103', N'30E-99999', N'RESOLVED', N'WRONG_PARKING_POSITION', N'STAFF', N'Staff ghi nh?n xe dang d? sai v? trí trên so d? giám sát.', N'Staff dã x? lý t?i qu?y.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (8, 12, 100000, 3, CAST(N'2026-07-31T10:16:59.5227373' AS DateTime2), NULL, NULL, N'30E-99999', N'RESOLVED', N'LOST_TICKET', N'STAFF', N'Staff dã d?i chi?u gi?y t? xe và thông tin khách hàng.', N'Staff da xac minh va lap bien ban mat ve tai quay.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (8, 13, 100000, 3, CAST(N'2026-07-31T10:23:33.4800360' AS DateTime2), NULL, NULL, N'30E-99999', N'RESOLVED', N'LOST_TICKET', N'STAFF', N'Staff dã d?i chi?u gi?y t? xe và thông tin khách hàng.', N'Da xac minh giay to, cho thanh toan phi gui xe va phi mat ve.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (NULL, 14, NULL, NULL, CAST(N'2026-07-31T10:24:48.7202911' AS DateTime2), NULL, NULL, N'72H-11111', N'RESOLVED', N'LOST_TICKET', N'GUEST', N'Nguon feedback #3 | Bien so: 72H-11111 | Guest: Thinh - 0326133968 | Noi dung: 123aqwsedawd', N'Staff da xac minh va lap bien ban mat ve tai quay.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (1, 15, 100000, 17, CAST(N'2026-07-31T10:25:02.6404729' AS DateTime2), NULL, NULL, N'72H-11111', N'RESOLVED', N'LOST_TICKET', N'STAFF', N'Staff dã d?i chi?u gi?y t? xe và thông tin khách hàng.', N'Da xac minh giay to, cho thanh toan phi gui xe va phi mat ve.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (1, 16, NULL, 30, CAST(N'2026-08-05T14:05:41.3861278' AS DateTime2), CAST(N'2026-08-05T14:05:46.5491034' AS DateTime2), NULL, N'72H-11111', N'RESOLVED', N'PAYMENT_ERROR', N'STAFF', N'Staff ghi nh?n l?i thanh toán t?i qu?y.', N'Staff dã xác nh?n thanh toán thành công t?i qu?y.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (1, 17, 100000, 30, CAST(N'2026-08-05T14:10:58.9567889' AS DateTime2), NULL, NULL, N'72H-11111', N'RESOLVED', N'LOST_TICKET', N'STAFF', N'Staff dã d?i chi?u gi?y t? xe và thông tin khách hàng.', N'Da xac minh giay to, cho thanh toan phi gui xe va phi mat ve.')
GO

INSERT [dbo].[IncidentReports] ([AssignedSlotID], [IncidentID], [PenaltyAmount], [SessionID], [CreatedAt], [ResolvedAt], [ActualSlotCode], [LicensePlate], [Status], [IncidentType], [CreatedBy], [EvidenceNote], [ResolutionNote]) VALUES (2, 18, 100000, 33, CAST(N'2026-08-08T09:37:45.3226669' AS DateTime2), NULL, NULL, N'72H12345', N'RESOLVED', N'LOST_TICKET', N'STAFF', N'Staff dã d?i chi?u gi?y t? xe và thông tin khách hàng.', N'Da xac minh giay to, cho thanh toan phi gui xe va phi mat ve.')
GO

SET IDENTITY_INSERT [dbo].[IncidentReports] OFF
GO
