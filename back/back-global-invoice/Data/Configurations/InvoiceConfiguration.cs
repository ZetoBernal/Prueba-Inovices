using back_global_invoice.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace back_global_invoice.Data.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Number).HasMaxLength(20).IsRequired();
        builder.HasIndex(i => i.Number).IsUnique();

        builder.Property(i => i.CustomerName).HasMaxLength(150).IsRequired();

        builder.Property(i => i.Type).HasConversion<string>().HasMaxLength(20).IsRequired();

        builder.Property(i => i.Subtotal).HasPrecision(18, 2);
        builder.Property(i => i.Iva).HasPrecision(18, 2);
        builder.Property(i => i.Retencion).HasPrecision(18, 2);
        builder.Property(i => i.Total).HasPrecision(18, 2);

        builder.Property(i => i.CustomsCode).HasMaxLength(30);
        builder.Property(i => i.CreatedBy).HasMaxLength(50).IsRequired();
    }
}