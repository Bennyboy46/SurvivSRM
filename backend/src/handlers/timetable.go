package handlers

import (
	"goscraper/src/helpers"
	"goscraper/src/types"
	"regexp"
	"strconv"
)

func parseBatchNumber(raw string) int {
	if raw == "" {
		return 1
	}

	if n, err := strconv.Atoi(raw); err == nil {
		if n == 1 || n == 2 {
			return n
		}
	}

	patterns := []string{
		`(?i)\bbatch\s*([12])\b`,
		`(?i)\bb\s*([12])\b`,
		`\b([12])\b`,
	}
	for _, pattern := range patterns {
		match := regexp.MustCompile(pattern).FindStringSubmatch(raw)
		if len(match) > 1 {
			if n, err := strconv.Atoi(match[1]); err == nil {
				return n
			}
		}
	}

	return 1
}

func GetTimetable(token string) (*types.TimetableResult, error) {
	scraper := helpers.NewTimetable(token)
	user, err := GetUser(token)
	if err != nil {
		return &types.TimetableResult{}, err
	}

	batchNum := parseBatchNumber(user.Batch)
	timetable, err := scraper.GetTimetable(batchNum)

	return timetable, err
}
