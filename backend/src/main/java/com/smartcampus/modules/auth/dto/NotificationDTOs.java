package com.smartcampus.modules.auth.dto;

import lombok.Data;

public class NotificationDTOs {

    @Data
    public static class PreferencesDTO {
        private Boolean inAppNotifications;
        private Boolean emailNotifications;
        private Boolean bookingUpdates;
        private Boolean ticketUpdates;
    }
}
