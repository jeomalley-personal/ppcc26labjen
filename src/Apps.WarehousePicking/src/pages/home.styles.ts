import { makeStyles, tokens } from "@fluentui/react-components"

export const useStyles = makeStyles({
  root: {
    width: "100%",
    minHeight: "100dvh",
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  headerInner: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "1240px",
    minHeight: "72px",
    marginInline: "auto",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalL,
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  brandMark: {
    width: "38px",
    height: "38px",
    borderRadius: tokens.borderRadiusMedium,
    display: "grid",
    placeItems: "center",
    color: "#ffffff",
    backgroundColor: "#175c4a",
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightBold,
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  brandTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase400,
  },
  brandCaption: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  main: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "1240px",
    marginInline: "auto",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
    flexWrap: "wrap",
  },
  pageTitle: {
    margin: 0,
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  pageDescription: {
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    flexWrap: "wrap",
    marginBottom: tokens.spacingVerticalL,
  },
  search: {
    width: "min(100%, 360px)",
  },
  tableWrap: {
    overflowX: "auto",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  table: {
    minWidth: "720px",
  },
  clickableName: {
    paddingInline: 0,
    minWidth: 0,
    fontWeight: tokens.fontWeightSemibold,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  empty: {
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
  },
  detailHeader: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    marginBottom: tokens.spacingVerticalXL,
  },
  detailCell: {
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  detailLabel: {
    display: "block",
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    marginBottom: tokens.spacingVerticalXS,
  },
  detailValue: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
  sectionHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    marginBlock: tokens.spacingVerticalXL,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: tokens.spacingVerticalM,
  },
  dialogSurface: {
    width: "min(100vw - 32px, 560px)",
  },
  statusLine: {
    marginTop: tokens.spacingVerticalM,
  },
})
