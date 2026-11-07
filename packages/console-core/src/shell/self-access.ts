// The signed-in identity's own access read and the store of its last refusal live in the framework's
// boot access extension, where an app's generated access policy reaches them without a kit. The kit
// hands them on from here so a shell and a refusal page read the one store the policy writes.
export { createSelfAccessPolicy, currentSelfAccessRefusal, useSelfAccessRefusal, type SelfAccessConfig, type SelfAccessRefusal } from "@simplix-react-ext/simplix-boot-access";
