import { useState } from "react";
import { Button, Dialog, DialogHeader, DialogTitle, Flex, FormFields, Grid } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { SearchIcon } from "lucide-react";
import DaumPostcodeEmbed from "react-daum-postcode";
import type { Address } from "react-daum-postcode";

import { PACKAGE_NAMESPACE } from "./locales";
import { BoundedDialogContent } from "../layout/bounded-dialog-content";

/** Countries whose addresses read large-to-small (postal code and region first). */
const EAST_ASIA_COUNTRIES = new Set(["KR", "JP", "CN", "TW", "HK", "MO"]);

/** The address field group shared by every user/profile address editor. */
export interface AddressFieldsetValues {
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  countryCode: string;
}

export interface AddressFieldsetProps {
  values: AddressFieldsetValues;
  onFieldChange: <K extends keyof AddressFieldsetValues>(field: K, value: AddressFieldsetValues[K]) => void;
  /** Resolves the field label — pass the owning entity translation's `fieldLabel`. */
  fieldLabel: (field: keyof AddressFieldsetValues) => string;
  disabled?: boolean;
}

/**
 * Country-aware address editor: an ISO-3166 country picker, field order that
 * follows the selected country's convention (East-Asian addresses read
 * large-to-small), and — for Korean addresses — a Daum postal-code lookup that
 * fills postal code, region, and street fields.
 */
export function AddressFieldset({ values, onFieldChange, fieldLabel, disabled }: AddressFieldsetProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const [postcodeOpen, setPostcodeOpen] = useState(false);

  const handlePostcodeComplete = (data: Address) => {
    // The lookup's full address repeats the region parts; keep addressLine1 to
    // the street-level remainder since sido/sigungu fill their own fields.
    const fullAddress = data.roadAddress || data.jibunAddress || data.address;
    onFieldChange("postalCode", data.zonecode);
    onFieldChange("stateProvince", data.sido);
    onFieldChange("city", data.sigungu);
    onFieldChange("addressLine1", fullAddress.replace(data.sido, "").replace(data.sigungu, "").trim());
    setPostcodeOpen(false);
  };

  const isEastAsia = EAST_ASIA_COUNTRIES.has(values.countryCode);
  const isKorea = values.countryCode === "KR";

  const postalCodeField = (
    <FormFields.TextField
      label={fieldLabel("postalCode")}
      value={values.postalCode}
      onChange={(v) => onFieldChange("postalCode", v)}
      disabled={disabled}
    />
  );

  const postalCodeWithLookup = isKorea ? (
    <Flex gap="xs" align="end" minSize>
      <Flex className="min-w-0 flex-1">{postalCodeField}</Flex>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mb-3.5 shrink-0"
        onClick={() => setPostcodeOpen(true)}
        disabled={disabled}
      >
        <SearchIcon />
        {t("address.searchPostalCode")}
      </Button>
    </Flex>
  ) : (
    postalCodeField
  );

  const regionFields = (
    <Grid columns={2} gapX="lg" gapY="sm" divider>
      <FormFields.TextField
        label={fieldLabel("stateProvince")}
        value={values.stateProvince}
        onChange={(v) => onFieldChange("stateProvince", v)}
        disabled={disabled}
      />
      <FormFields.TextField
        label={fieldLabel("city")}
        value={values.city}
        onChange={(v) => onFieldChange("city", v)}
        disabled={disabled}
      />
    </Grid>
  );

  const streetFields = (
    <>
      <FormFields.TextField
        label={fieldLabel("addressLine1")}
        value={values.addressLine1}
        onChange={(v) => onFieldChange("addressLine1", v)}
        disabled={disabled}
      />
      <FormFields.TextField
        label={fieldLabel("addressLine2")}
        value={values.addressLine2}
        onChange={(v) => onFieldChange("addressLine2", v)}
        disabled={disabled}
      />
    </>
  );

  return (
    <>
      <FormFields.CountryField
        label={fieldLabel("countryCode")}
        value={values.countryCode}
        onChange={(v) => onFieldChange("countryCode", v)}
        disabled={disabled}
      />
      {isEastAsia ? (
        <>
          {postalCodeWithLookup}
          {regionFields}
          {streetFields}
        </>
      ) : (
        <>
          {streetFields}
          {regionFields}
          {postalCodeWithLookup}
        </>
      )}

      <Dialog open={postcodeOpen} onOpenChange={setPostcodeOpen}>
        <BoundedDialogContent className="max-w-lg p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>{t("address.searchPostalCode")}</DialogTitle>
          </DialogHeader>
          {postcodeOpen && (
            <DaumPostcodeEmbed onComplete={handlePostcodeComplete} style={{ height: 460 }} autoClose={false} />
          )}
        </BoundedDialogContent>
      </Dialog>
    </>
  );
}
