import { NgModule } from '@angular/core';

import { TablerIconsModule } from 'angular-tabler-icons';
// import { IconMenu2, IconBrandDiscord, IconSettings, IconUsers } from 'angular-tabler-icons/icons';
import { IconAlertTriangle, IconAmbulance, IconArrowBigRight, IconBackslash, IconBaselineDensityMedium, IconBox, IconBrandDiscord, IconBriefcase2, IconBuilding, IconBuildingPlus, IconCalendarMonth, IconCalendarWeek, IconCaretLeft, IconCaretLeftFilled, IconCategoryPlus, IconChalkboard, IconCheck, IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconChevronUp, IconClipboardPlus, IconClockHour4, IconCopy, IconCornerUpLeft, IconDeviceDesktop, IconDeviceMobile, IconDotsVertical, IconEdit, IconExclamationMark, IconFilePencil, IconFileReport, IconFilter, IconFlag3Filled, IconGenderFemale, IconGenderMale, IconHomePlus, IconInfinity, IconInfoCircle, IconKeyFilled, IconLetterD, IconLetterN, IconLetterO, IconLetterP, IconLock, IconLogout, IconMail, IconMath1Divide2, IconMeat, IconMenu2, IconMessages, IconMinus, IconNote, IconNotes, IconNumber1, IconOld, IconPaperclip, IconPasswordUser, IconPencil, IconPhone, IconPlus, IconQuestionMark, IconRocket, IconSchool, IconSearch, IconSettings, IconSettings2, IconShield, IconSlash, IconSquareForbid, IconStars, IconTable, IconTags, IconThumbUp, IconTimeDuration5, IconTrashXFilled, IconTrophy, IconUpload, IconUser, IconUsers, IconUserScreen, IconUserX, IconWindowMaximize, IconWindowMinimize, IconX } from 'angular-tabler-icons/icons';

// Select some icons (use an object, not an array)
const icons = {
  IconMenu2,
  IconBrandDiscord,
  IconSettings,
  IconUsers,
  IconChalkboard,
  IconLogout,
  IconTimeDuration5,
  IconNotes,
  IconTable,
  IconMeat,
  IconInfinity,
  IconWindowMinimize,
  IconWindowMaximize,
  IconDotsVertical,
  IconCalendarMonth,
  IconExclamationMark,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronsRight,
  IconChevronRight,
  IconChevronUp,
  IconChevronDown,
  IconCheck,
  IconX,
  IconUserX,
  IconTags,
  IconPaperclip,
  IconOld,
  IconUserScreen,
  IconFilter,
  IconMessages,
  IconMail,
  IconCornerUpLeft,
  IconArrowBigRight,
  IconSquareForbid,
  IconBriefcase2,
  IconFileReport,
  IconThumbUp,
  IconShield,
  IconSchool,
  IconBuilding,
  IconCalendarWeek,
  IconEdit,
  IconTrashXFilled,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconBaselineDensityMedium,
  IconSlash,
  IconMinus,
  IconLetterN,
  IconLetterP,
  IconLetterO,
  IconLetterD,
  IconAlertTriangle,
  IconInfoCircle,
  IconQuestionMark,
  IconGenderMale,
  IconGenderFemale,
  IconPlus,
  IconPencil,
  IconClockHour4,
  IconPhone,
  IconCaretLeftFilled,
  IconBox,
  IconFlag3Filled,
  IconTrophy,
  IconSettings2,
  IconUser,
  IconFilePencil,
  IconNote,
  IconClipboardPlus,
  IconStars,
  IconCategoryPlus,
  IconHomePlus,
  IconNumber1,
  IconBuildingPlus,
  IconPasswordUser,
  IconKeyFilled,
  IconLock,
  IconSearch,
  IconAmbulance,
  IconCopy,
  IconRocket,
  IconUpload
};

@NgModule({
  imports: [
    TablerIconsModule.pick(icons)
  ],
  exports: [
    TablerIconsModule
  ]
})

export class IconsModule {}