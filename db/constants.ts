export const userPermissions = () => {
  return {
    assign: true,
    upload: true,
    edit: true,
    delete: true,
    generate: true,
    download: true,
    update: true,
    split: true,
  };
};

export const options: any = (ty) => {
  return ty === "Status"
    ? [
        { label: "Active", value: "Active" },
        { label: "Pending", value: "Pending" },
        { label: "Inactive", value: "Inactive" },
      ]
    : ty === "Management Role"
    ? [
        { label: "SuperAdmin", value: "SuperAdmin" },
        { label: "Admin", value: "Admin" },
        { label: "User", value: "User" },
      ]
    : ty === "Role"
    ? [
        { label: "Apex", value: "apex" },
        { label: "ServiceProvider", value: "serviceProvider" },
        { label: "Client", value: "client" },
      ]
    : ty === "File Status"
    ? [
        { label: "Conversion Successful", value: "Success" },
        { label: "Conversion Pending", value: "Pending" },
        { label: "Conversion Failed", value: "Failed" },
      ]
    : ["Period", "Type"].includes(ty)
    ? [
        { label: "Duration", value: "duration" },
        { label: "Instant", value: "instant" },
      ]
    : ty === "Balance"
    ? [
        { label: "Unspecified", value: "" },
        { label: "Debit", value: "debit" },
        { label: "Credit", value: "credit" },
      ]
    : ["Deprecated", "Abstract"].includes(ty)
    ? [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ]
    : ty === "Period Match"
    ? [{ label: "Don't Match", value: "" }]
    : ty === "Indenting"
    ? [
        { label: "0 (none)", value: "" },
        { label: "1", value: "01" },
        { label: "2", value: "02" },
        { label: "3", value: "03" },
        { label: "4", value: "04" },
        { label: "5", value: "05" },
      ]
    : ty === "Precision"
    ? [
        { label: "default", value: "" },
        { label: "Infinite", value: "i" },
        { label: "0 (Ones)", value: "p0" },
        { label: "-3 (Thousands)", value: "n3" },
        { label: "-6 (Millions)", value: "n6" },
        { label: "-9 (Billions)", value: "n9" },
        { label: "-------------", value: "" },
        { label: "-1(Tens)", value: "n1" },
        { label: "-2(Hundreds)", value: "n2" },
        { label: "-4(Ten Thousands)", value: "n4" },
        { label: "-5(Hundred Thousands)", value: "n5" },
        { label: "-7(Ten Millions)", value: "n7" },
        { label: "-8(Hundred Millions)", value: "n8" },
        { label: "-------------", value: "" },
        { label: "1 (Tenths)", value: "p1" },
        { label: "2 (Hundredths)", value: "p2" },
        { label: "3 (Thousandths)", value: "p3" },
        { label: "4 (Ten Thousandths)", value: "p4" },
        { label: "5 (Hundred Thousandths)", value: "p5" },
        { label: "6 (Millionths)", value: "p6" },
        { label: "7 (Ten Millionths)", value: "p7" },
        { label: "8 (Hundred Millionths)", value: "p8" },
        { label: "9 (Billionths)", value: "p9" },
      ]
    : ty === "Counted As"
    ? [
        { label: "default", value: "" },
        { label: "0 (As Entered)", value: "p0" },
        { label: "-3 (Thousands)", value: "n3" },
        { label: "-6 (Millions)", value: "n6" },
        { label: "-9 (Billions)", value: "n9" },
        { label: "-------------", value: "" },
        { label: "-1(Tens)", value: "n1" },
        { label: "-2(Hundreds)", value: "n2" },
        { label: "-4(Ten Thousands)", value: "n4" },
        { label: "-5(Hundred Thousands)", value: "n5" },
        { label: "-7(Ten Millions)", value: "n7" },
        { label: "-8(Hundred Millions)", value: "n8" },
        { label: "-------------", value: "" },
        { label: "1 (Tenths)", value: "p1" },
        { label: "2 (Hundredths)", value: "p2" },
        { label: "3 (Thousandths)", value: "p3" },
        { label: "4 (Ten Thousandths)", value: "p4" },
        { label: "5 (Hundred Thousandths)", value: "p5" },
        { label: "6 (Millionths)", value: "p6" },
        { label: "7 (Ten Millionths)", value: "p7" },
        { label: "8 (Hundred Millionths)", value: "p8" },
        { label: "9 (Billionths)", value: "p9" },
      ]
    : ty === "Preset"
    ? [
        { label: "Percent/Ratio/Interest", value: "Percent/Ratio/Interest" },
        { label: "Months", value: "Months" },
        { label: "Years", value: "Years" },
        // { label: "Percent/Ratio/Interest", value: "Percent/Ratio/Interest" },
        // { label: "Months", value: "Months" },
        // { label: "Years", value: "Years" },
      ]
    : ty === "Default For"
    ? [
        { label: "(Not default)", value: "" },
        { label: "Monetary", value: "Monetary" },
        { label: "Shares", value: "Shares" },
        { label: "Money Per Share", value: "Money Per Share" },
        { label: "Ratio", value: "Ratio" },
        { label: "Integer", value: "Integer" },
        { label: "Decimal", value: "Decimal" },
        { label: "Per Unit", value: "Per Unit" },
        { label: "Area", value: "Area" },
        { label: "Volume", value: "Volume" },
        { label: "Mass", value: "Mass" },
        { label: "Weight", value: "Weight" },
        { label: "Energy", value: "Energy" },
        { label: "Power", value: "Power" },
        { label: "Length", value: "Length" },
        { label: "Memory", value: "Memory" },
        { label: "Fraction", value: "Fraction" },
      ]
    : ["Numerator", "Denominator"].includes(ty)
    ? [
        {
          label: "",
          options: [
            { label: "Shares", value: "Shares" },
            { label: "Pure", value: "Pure" },
            { label: "CAD Canadian dollar (C$)", value: "CAD Canadian dollar (C$)" },
            { label: "CNY Chinese yuan (¥)", value: "CNY Chinese yuan (¥)" },
            { label: "EUR Euro (€)", value: "EUR Euro (€)" },
            { label: "GBP Pound sterling (£)", value: "GBP Pound sterling (£)" },
            { label: "JPY Japanese yen (¥)", value: "JPY Japanese yen (¥)" },
            { label: "USD United States dollar ($)", value: "USD United States dollar ($)" },
          ],
        },
        { label: "---Recommended Units (UTR)", options: [] },
        {
          label: "---Time",
          options: [
            { label: "Y Year", value: "Y Year" },
            { label: "M Month", value: "M Month" },
            { label: "D Day", value: "D Day" },
            { label: "H Hour", value: "H Hour" },
            { label: "MM Minute", value: "MM Minute" },
            { label: "S Second", value: "S Second" },
          ],
        },
        {
          label: "---Area",
          options: [
            { label: "acre Acre", value: "acre Acre" },
            { label: "ha Hectare", value: "ha Hectare" },
            { label: "sqft Square Foot", value: "sqft Square Foot" },
            { label: "sqmi Square Mile", value: "sqmi Square Mile" },
            { label: "sqm Square Metre", value: "sqm Square Metre" },
            { label: "sqkm Square Kilometre", value: "sqkm Square Kilometre" },
          ],
        },
        {
          label: "---Energy",
          options: [
            { label: "Boe Barrel of Oil Equivalent", value: "Boe Barrel of Oil Equivalent" },
            { label: "Btu British Thermal Unit", value: "Btu British Thermal Unit" },
            { label: "ft_lb Foot-Pound", value: "ft_lb Foot-Pound" },
            {
              label: "MBoe Thousand Barrels of Oil Equivalent",
              value: "MBoe Thousand Barrels of Oil Equivalent",
            },
            {
              label: "Mcfe Thousand Cubic Foot Equivalent",
              value: "Mcfe Thousand Cubic Foot Equivalent",
            },
            {
              label: "MMBoe Millions of Barrel of Oil Equivalent",
              value: "MMBoe Millions of Barrel of Oil Equivalent",
            },
            { label: "MMBTU Millions of BTU", value: "MMBTU Millions of BTU" },
            { label: "Cal Calorie", value: "Cal Calorie" },
            { label: "J Joule", value: "J Joule" },
            { label: "kJ Kilojoule", value: "kJ Kilojoule" },
            { label: "kWh Kilowatt-Hours", value: "kWh Kilowatt-Hours" },
            { label: "mJ Millijoules", value: "mJ Millijoules" },
            { label: "MWh Megawatt-Hour", value: "MWh Megawatt-Hour" },
          ],
        },
        {
          label: "---Length",
          options: [
            { label: "ft Foot", value: "ft Foot" },
            { label: "in Inch", value: "in Inch" },
            { label: "mi Mile", value: "mi Mile" },
            { label: "nmi Nautical Mile", value: "nmi Nautical Mile" },
            { label: "yd Yard", value: "yd Yard" },
            { label: "m Metre", value: "m Metre" },
            { label: "cm Centimetre", value: "cm Centimetre" },
            { label: "dm Decimetre", value: "dm Decimetre" },
            { label: "km Kilometre", value: "km Kilometre" },
            { label: "mm Millimetre", value: "mm Millimetre" },
          ],
        },
        {
          label: "---Mass",
          options: [
            { label: "lb Pound", value: "lb Pound" },
            { label: "oz Ounce", value: "oz Ounce" },
            { label: "ozt Troy Ounce", value: "ozt Troy Ounce" },
            { label: "T Ton", value: "T Ton" },
            { label: "t Tonne", value: "t Tonne" },
            { label: "g Gram", value: "g Gram" },
            { label: "kg Kilogram", value: "kg Kilogram" },
            { label: "Mg Metric Ton", value: "Mg Metric Ton" },
          ],
        },
        // {
        //   label: "---Volume",
        //   options: [],
        // },
        // {
        //   label: "---Power",
        //   options: [],
        // },
        // {
        //   label: "---Memory",
        //   options: [],
        // },
        // {
        //   label: "---Other",
        //   options: [],
        // },
      ]
    : [];
};
