#!/usr/bin/env perl

use warnings;
use strict;

use Time::Local 'timegm';

my @header;
my $data;

while (<>) {

	# the third line is the header
	if ($. == 3) {
		          # and we want the years in epoch seconds
		@header = map { m/^(\d{4})/; year_to_seconds($1); }
	              (split ',')[1..11];
	}

	if (m/^United States/) {
		my $i = -1;
		$data = "[ " . join(", ", map { "{ x: $header[++$i], y: $_ }" } (split ',')[1..11]) . " ]";
		last;
	}
}

sub year_to_seconds {
	my $year = shift;
	return timegm(0, 0, 0, 1, 0, $year);
}

print $data;
