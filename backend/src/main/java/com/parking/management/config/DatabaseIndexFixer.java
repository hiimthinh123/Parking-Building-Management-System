package com.parking.management.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseIndexFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Tự động xóa các ràng buộc UNIQUE cũ chỉ nằm trên cột SlotCode đơn lẻ trong SQL Server
            String dropConstraintsSql = 
                "DECLARE @sql NVARCHAR(MAX) = ''; " +
                "SELECT @sql += 'ALTER TABLE Slots DROP CONSTRAINT ' + QUOTENAME(kc.name) + ';' " +
                "FROM sys.key_constraints kc " +
                "JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id " +
                "JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id " +
                "WHERE kc.parent_object_id = OBJECT_ID('Slots') AND c.name = 'SlotCode' " +
                "GROUP BY kc.name HAVING COUNT(ic.column_id) = 1; " +
                "IF @sql <> '' EXEC sp_executesql @sql;";

            jdbcTemplate.execute(dropConstraintsSql);

            // Tự động xóa các UNIQUE Index cũ trên cột SlotCode đơn lẻ trong SQL Server
            String dropIndexesSql = 
                "DECLARE @sql2 NVARCHAR(MAX) = ''; " +
                "SELECT @sql2 += 'DROP INDEX ' + QUOTENAME(i.name) + ' ON Slots;' " +
                "FROM sys.indexes i " +
                "JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id " +
                "JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id " +
                "WHERE i.object_id = OBJECT_ID('Slots') AND i.is_unique = 1 AND i.is_primary_key = 0 AND c.name = 'SlotCode' " +
                "GROUP BY i.name HAVING COUNT(ic.column_id) = 1; " +
                "IF @sql2 <> '' EXEC sp_executesql @sql2;";

            jdbcTemplate.execute(dropIndexesSql);

            System.out.println("✅ DatabaseIndexFixer: Đã tự động dọn dẹp các ràng buộc UNIQUE cũ trên cột SlotCode trong SQL Server.");

            // Tự động chuẩn hóa lại font tiếng Việt bị lỗi mã hóa trong bảng IncidentReports ở SQL Server
            try {
                jdbcTemplate.execute("UPDATE IncidentReports SET EvidenceNote = N'Staff ghi nhận lỗi thanh toán tại quầy.' WHERE EvidenceNote LIKE '%ghi%nh%n%l%i%' OR EvidenceNote LIKE '%thanh%to%n%t%i%qu%'");
                jdbcTemplate.execute("UPDATE IncidentReports SET EvidenceNote = N'Staff đã đối chiếu giấy tờ xe và thông tin khách hàng.' WHERE EvidenceNote LIKE '%d%i%chi%u%gi%y%t%' OR EvidenceNote LIKE '%kh%ch%h%ng%'");
                jdbcTemplate.execute("UPDATE IncidentReports SET EvidenceNote = N'Staff ghi nhận xe đang đỗ sai vị trí trên sơ đồ giám sát.' WHERE EvidenceNote LIKE '%ghi%nh%n%xe%dang%' OR EvidenceNote LIKE '%sai%v%tr%'");
                jdbcTemplate.execute("UPDATE IncidentReports SET EvidenceNote = N'Không chấp hành đúng quy định' WHERE EvidenceNote LIKE '%ch%p%h%nh%d%ng%'");
                jdbcTemplate.execute("UPDATE IncidentReports SET EvidenceNote = N'Noi dung: Mất thẻ xe ở tòa nhà 2' WHERE EvidenceNote LIKE '%M%t%th%xe%t%a%nh%' OR EvidenceNote LIKE '%M%t%th%xe%'");
                System.out.println("✅ DatabaseIndexFixer: Đã chuẩn hóa lại dữ liệu font tiếng Việt trong bảng IncidentReports.");
            } catch (Exception eNote) {
                // Ignore if table structure differs
            }
        } catch (Exception e) {
            System.err.println("⚠️ DatabaseIndexFixer note: " + e.getMessage());
        }
    }
}
